import { Types } from "mongoose";

// models
import { Item } from "../models/item";

// helpers
import { randomString } from "@fujingr/common";

export const createItem = async () => {
  const item = new Item({
    qrCode: randomString(5),
    lengthInMeters: 40,
    lengthInYards: 40 * 1.09,
  });
  await item.save();

  return item;
};

export const id = new Types.ObjectId().toHexString();
