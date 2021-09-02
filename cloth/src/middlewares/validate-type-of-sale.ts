import { Request, Response, NextFunction } from "express";

// errors
import { BadRequestError } from "@fujingr/common";

// constants
import { TypeOfSale } from "../constants/enum-type-of-sale";

// models
import { ArticleAttrs } from "../models/article";

export const validateTypeOfSale = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { typeOfSale } = req.body as ArticleAttrs;

  if (!Object.values(TypeOfSale).includes(typeOfSale)) {
    throw new BadRequestError("Wrong field typeOfSale");
  }

  next();
};
