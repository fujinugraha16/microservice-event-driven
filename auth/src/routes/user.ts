import express from "express";
import { Types } from "mongoose";

// errors
import { BadRequestError } from "@fujingr/common";
import { NotFoundError } from "@fujingr/common";

// middlewares
import { requireAuth } from "@fujingr/common";
import { currentUser } from "@fujingr/common";

// models
import { User } from "../models/user";

// contansts
import { Role } from "@fujingr/common";

const router = express.Router();

router.get(
  "/api/auth/user/:id",
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

    res.status(200).send(user);
  }
);

export { router as userRouter };
