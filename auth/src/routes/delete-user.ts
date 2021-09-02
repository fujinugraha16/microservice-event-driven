import express from "express";
import { Types } from "mongoose";

// constants
import { Role } from "@fujingr/common";

// errors
import { BadRequestError } from "@fujingr/common";
import { NotFoundError } from "@fujingr/common";

// middlewares
import { currentUser } from "@fujingr/common";
import { requireAuth } from "@fujingr/common";

// models
import { User } from "../models/user";

const router = express.Router();

router.delete(
  "/api/auth/delete-user/:id",
  currentUser,
  requireAuth(Role.admin),
  async (req, res) => {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestError("Param 'id' invalid");
    }

    const user = await User.findById(id);
    if (!user) {
      throw new NotFoundError();
    }

    await User.findByIdAndRemove(id);

    res.status(204).send({ success: true });
  }
);

export { router as deleteUserRouter };
