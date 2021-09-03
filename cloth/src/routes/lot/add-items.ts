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

// events
import { natsWrapper } from "../../nats-wrapper";
import { LotAddItemsPublisher } from "../../events/publisher/lot-add-items-event";

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

    const { designs: lotDesigns } = await lot.populate({
      path: "designs",
      select: "-_id name color items",
      populate: {
        path: "items",
        select: "lengthInMeters lengthInYards qrCode",
      },
    });

    // publish event
    await new LotAddItemsPublisher(natsWrapper.client).publish({
      article: {
        id: lot.article.id,
        name: lot.article.name,
      },
      designs: lotDesigns,
    });

    res.status(200).send(lot);
  }
);

export { router as addItemsRouter };
