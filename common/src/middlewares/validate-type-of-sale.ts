import { Request, Response, NextFunction } from "express";

// errors
import { BadRequestError } from "../errors/bad-request-error";

// constants
import { TypeOfSale } from "../constants/enum-type-of-sale";

export const validateTypeOfSale = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { typeOfSale } = req.body as { typeOfSale: TypeOfSale };

  if (!Object.values(TypeOfSale).includes(typeOfSale)) {
    throw new BadRequestError("Wrong field typeOfSale");
  }

  next();
};
