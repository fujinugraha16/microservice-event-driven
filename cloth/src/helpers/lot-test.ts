import { Types } from "mongoose";

import { Lot } from "../models/lot";

const designId = new Types.ObjectId().toHexString();

export const createLot = (articleId: string) => async () => {
  const lot = new Lot({
    code: "ARTICLE-LOT",
    pureLotCode: "LOT",
    article: articleId,
    designs: [designId],
    supplier: "PT. Aliex Retail",
  });
  await lot.save();

  return lot;
};

export const articleId = new Types.ObjectId().toHexString();

export const id = new Types.ObjectId().toHexString();
