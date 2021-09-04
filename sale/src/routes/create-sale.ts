import express, { Request, Response } from "express";
import { body } from "express-validator";

// middlewares
import { requireAuth, validateRequest } from "@fujingr/common";
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

const router = express.Router();

router.post(
  "/api/sale/create",
  requireAuth([Role.admin, Role.employee]),
  body(["code", "customerName"]).notEmpty().withMessage("Must be filled"),
  body(["retailItems", "wholesalerItems", "lotItems"])
    .isArray()
    .withMessage("Must be array"),
  body(["totalPrice", "totalQty"])
    .isInt({ gt: 0 })
    .withMessage("Must be numeric and greater than 0")
    .notEmpty()
    .withMessage("Must be filled"),
  validateRequest,
  validateRetailItems,
  validateWholeSalerItems,
  validateLotItems,
  async (req: Request, res: Response) => {
    const { code, customerName, retailItems, wholesalerItems, lotItems } =
      req.body as SaleAttrs;
    const notFoundItemsQrCode: string[] = [];
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
    }

    if (wholesalerItems && wholesalerItems.length > 0) {
      const wholesalerItemsPrx = await wholesalerItemsProcessing(
        wholesalerItems
      );

      totalPrice += wholesalerItemsPrx.totalPrice;
      totalQty += wholesalerItemsPrx.totalQty;
      notFoundItemsQrCode.push(...wholesalerItemsPrx.notFoundItemsQrCode);
    }

    if (lotItems && lotItems.length > 0) {
      const lotItemsPrx = await lotItemsProcessing(lotItems);

      totalPrice += lotItemsPrx.totalPrice;
      totalQty += lotItemsPrx.totalQty;
      notFoundItemsQrCode.push(...lotItemsPrx.notFoundItemsQrCode);
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

    res
      .status(200)
      .send(
        notFoundItemsQrCode.length > 0 ? { sale, notFoundItemsQrCode } : sale
      );
  }
);

export { router as createSaleRouter };
