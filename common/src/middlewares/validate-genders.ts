import { Request, Response, NextFunction } from "express";

// constants
import { Gender } from "../constants/enum-gender";

// errors
import { BadRequestError } from "../errors/bad-request-error";

export const validateGenders = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { genders } = req.body as { genders: Gender[] };

  if (
    genders &&
    genders.length > 0 &&
    !genders.every((gender) => Object.values(Gender).includes(gender))
  ) {
    throw new BadRequestError("Wrong field genders");
  }

  next();
};
