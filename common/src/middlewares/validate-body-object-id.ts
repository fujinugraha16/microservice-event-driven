import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";

// errors
import { BadRequestError } from "../errors/bad-request-error";

export const validateBodyObjectId =
  (field: string) => (req: Request, res: Response, next: NextFunction) => {
    if (!req.body[field]) {
      throw new BadRequestError(`Field '${field}' is empty`);
    }

    if (!Types.ObjectId.isValid(req.body[field])) {
      throw new BadRequestError(`Field '${field}' invalid`);
    }

    next();
  };
