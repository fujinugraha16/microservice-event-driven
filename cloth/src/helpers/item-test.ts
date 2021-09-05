import { Types } from "mongoose";

// models
import { Item } from "../models/item";

// helpers
import { randomString } from "@fujingr/common";

export const createItem = async (qrCode: string = randomString(5)) => {
  const item = new Item({
    qrCode,
    lengthInMeters: 40,
    lengthInYards: 40 * 1.09,
  });
  await item.save();

  return item;
};

export const id = new Types.ObjectId().toHexString();
