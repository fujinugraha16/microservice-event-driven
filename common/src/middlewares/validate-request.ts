import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";

// errors
import { RequestValidatonError } from "../errors/request-validation-error";

export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    throw new RequestValidatonError(errors.array());
  }

  next();
};
