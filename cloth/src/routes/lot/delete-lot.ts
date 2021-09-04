import express from "express";

// middlewares
import { requireAuth, validateParamId } from "@fujingr/common";

// constants
import { Role } from "@fujingr/common";

// models
import { Lot } from "../../models/lot";
import { Price } from "../../models/price";

// errors
import { NotFoundError } from "@fujingr/common";

// helpers
import { deleteDesignsAndItems } from "../../helpers/delete-designs-and-items";
import { getDesignsPayloadEvent } from "../../helpers/get-designs-payload-event";

// events
import { natsWrapper } from "../../nats-wrapper";
import { LotDeletedPublisher } from "../../events/publisher/lot-deleted-event";

const router = express.Router();

router.delete(
  "/api/cloth/lot/delete/:id",
  requireAuth([Role.admin, Role.employee]),
  validateParamId,
  async (req, res) => {
    const { id } = req.params;

    const lot = await Lot.findById(id);
    if (!lot) {
      throw new NotFoundError();
    }

    // delete desings and items
    await deleteDesignsAndItems(lot.designs);

    // delete price too
    if (lot.price) {
      await Price.findByIdAndRemove(lot.price);
    }

    // delete lot
    await Lot.findByIdAndRemove(id);

    // publish event
    const designsPayloadEvent = await getDesignsPayloadEvent(lot.designs);

    await new LotDeletedPublisher(natsWrapper.client).publish({
      article: {
        id: lot.article.toString(),
      },
      designs: designsPayloadEvent,
    });

    res.status(204).send({ success: true });
  }
);

export { router as deleteLotRouter };
