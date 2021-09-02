import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";

// errors
import { BadRequestError } from "../errors/bad-request-error";

export const validateParamId = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;

  if (!Types.ObjectId.isValid(id)) {
    throw new BadRequestError("Param 'id' invalid");
  }

  next();
};
