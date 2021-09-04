import express, { Request, Response } from "express";
import { body } from "express-validator";

// middlewares
import { requireAuth, validateParamId, validateRequest } from "@fujingr/common";
import { validateDesignsPayload } from "../../middlewares/validate-designs-payload";

// constants
import { Role } from "@fujingr/common";

// models
import { Lot } from "../../models/lot";

// errors
import { NotFoundError } from "@fujingr/common";

// helpers
import { updateDesignsPayload } from "../../helpers/update-designs-payload";
import { saveItems } from "../../helpers/save-items";
import { parseLotDesigns } from "../../helpers/parse-lot-designs";

// events
import { natsWrapper } from "../../nats-wrapper";
import { LotAddItemsPublisher } from "../../events/publisher/lot-add-items-publisher";

const router = express.Router();

router.put(
  "/api/cloth/lot/:id/add-items",
  requireAuth([Role.admin, Role.employee]),
  validateParamId,
  body("designs")
    .isArray()
    .withMessage("Must be array")
    .notEmpty()
    .withMessage("Must be filled array"),
  validateRequest,
  validateDesignsPayload,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { designs } = req.body;

    const lot = await Lot.findById(id).populate("article");
    if (!lot) {
      throw new NotFoundError();
    }

    const inputSequence = lot.inputSequence + 1;

    // update designs payload
    const updatedDesigns = updateDesignsPayload(designs, inputSequence);

    // save items and update design
    await saveItems(updatedDesigns);

    // update inputSequence lot
    lot.set({ inputSequence });
    await lot.save();

    // publish event
    const designsPayloadEvent = await parseLotDesigns(
      lot.designs,
      inputSequence
    );

    await new LotAddItemsPublisher(natsWrapper.client).publish({
      article: {
        id: (lot.article as unknown as { id: string }).id,
        name: (lot.article as unknown as { name: string }).name,
      },
      designs: designsPayloadEvent,
    });

    res.status(200).send(lot);
  }
);

export { router as addItemsRouter };
