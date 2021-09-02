import { Types } from "mongoose";

import { Article } from "../models/article";

// constants
import { TypeOfSale } from "../constants/enum-type-of-sale";

export const createArticle = async () => {
  const article = new Article({
    code: "ASD",
    name: "Test Cloth",
    typeOfSale: TypeOfSale.lot,
    width: 100,
    safetyStock: 20,
    gsm: 10,
  });
  await article.save();

  return article;
};

export const id = new Types.ObjectId().toHexString();
