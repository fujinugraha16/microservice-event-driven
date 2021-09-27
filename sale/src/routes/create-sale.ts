import express, { Request, Response } from "express";
import { body } from "express-validator";

// middlewares
import {
  requireAuth,
  SaleCreatedEvent,
  validateRequest,
} from "@fujingr/common";
import { validateRetailItems } from "../middlewares/validate-retail-items";
import { validateWholeSalerItems } from "../middlewares/validate-wholesaler-items";
import { validateLotItems } from "../middlewares/validate-lot-items";

// constants
import { Role } from "@fujingr/common";

// models
import { Sale, SaleAttrs } from "../models/sale";

// errors
import { BadRequestError } from "@fujingr/common";
import { retailItemsProcessing } from "../helpers/retail-items-processing";
import { wholesalerItemsProcessing } from "../helpers/wholesaler-items-processing";
import { lotItemsProcessing } from "../helpers/lot-items-processing";

// events
import { StockPayload } from "@fujingr/common";
import { SaleCreatedPublisher } from "../events/publisher/sale-created-publisher";
import { natsWrapper } from "../nats-wrapper";

const router = express.Router();

router.post(
  "/api/sale/create",
  requireAuth([Role.admin, Role.employee]),
  body(["code", "customerName"]).notEmpty().withMessage("Must be filled"),
  body(["retailItems", "wholesalerItems", "lotItems"])
    .optional()
    .isArray()
    .withMessage("Must be array"),
  validateRequest,
  validateRetailItems,
  validateWholeSalerItems,
  validateLotItems,
  async (req: Request, res: Response) => {
    const { code, customerName, retailItems, wholesalerItems, lotItems } =
      req.body as SaleAttrs;
    const notFoundItemsQrCode: string[] = [];
    const stockPayloads: StockPayload[] = [];
    let updatedRetailItems: SaleCreatedEvent["data"]["retailItems"];
    let updatedWholesalerItems: SaleCreatedEvent["data"]["wholesalerItems"];
    let updatedLotItems: SaleCreatedEvent["data"]["lotItems"];
    let totalPrice = 0;
    let totalQty = 0;

    const existingSale = await Sale.findOne({ code });
    if (existingSale) {
      throw new BadRequestError("Sale already exist");
    }

    if (retailItems && retailItems.length > 0) {
      const retailItemsPrx = await retailItemsProcessing(retailItems);

      totalPrice += retailItemsPrx.totalPrice;
      totalQty += retailItemsPrx.totalQty;
      notFoundItemsQrCode.push(...retailItemsPrx.notFoundItemsQrCode);
      stockPayloads.push(...retailItemsPrx.stockPayloads);
      updatedRetailItems = retailItemsPrx.updatedRetailItems;
    }

    if (wholesalerItems && wholesalerItems.length > 0) {
      const wholesalerItemsPrx = await wholesalerItemsProcessing(
        wholesalerItems
      );

      totalPrice += wholesalerItemsPrx.totalPrice;
      totalQty += wholesalerItemsPrx.totalQty;
      notFoundItemsQrCode.push(...wholesalerItemsPrx.notFoundItemsQrCode);
      stockPayloads.push(...wholesalerItemsPrx.stockPayloads);
      updatedWholesalerItems = wholesalerItemsPrx.updatedWholesalerItems;
    }

    if (lotItems && lotItems.length > 0) {
      const lotItemsPrx = await lotItemsProcessing(lotItems);

      totalPrice += lotItemsPrx.totalPrice;
      totalQty += lotItemsPrx.totalQty;
      notFoundItemsQrCode.push(...lotItemsPrx.notFoundItemsQrCode);
      stockPayloads.push(...lotItemsPrx.stockPayloads);
      updatedLotItems = lotItemsPrx.updatedLotItems;
    }

    const sale = new Sale({
      code,
      customerName,
      retailItems,
      wholesalerItems,
      lotItems,
      totalPrice,
      totalQty,
    });
    await sale.save();

    // event publisher
    await new SaleCreatedPublisher(natsWrapper.client).publish({
      retailItems: updatedRetailItems,
      wholesalerItems: updatedWholesalerItems,
      lotItems: updatedLotItems,
      stockPayloads,
    });

    res
      .status(201)
      .send(
        notFoundItemsQrCode.length > 0 ? { sale, notFoundItemsQrCode } : sale
      );
  }
);

export { router as createSaleRouter };
