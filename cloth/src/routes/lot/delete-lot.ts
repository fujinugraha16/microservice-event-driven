import express from "express";

// middlewares
import { requireAuth, validateParamId } from "@fujingr/common";

// constants
import { Role } from "@fujingr/common";
import { Lot } from "../../models/lot";

// errors
import { NotFoundError } from "@fujingr/common";

// helpers
import { deleteDesignsAndItems } from "../../helpers/delete-designs-and-items";

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

    // delete lot
    await Lot.findByIdAndRemove(id);

    res.status(204).send({ success: true });
  }
);

export { router as deleteLotRouter };
