import { Schema, model } from "mongoose";

interface ItemAttrs {
  qrCode: string;
  lengthInMeters: number;
  lengthInYards: number;
}

const itemSchema = new Schema<ItemAttrs>(
  {
    qrCode: {
      type: String,
      required: true,
    },
    lengthInMeters: {
      type: Number,
      required: true,
    },
    lengthInYards: {
      type: Number,
      required: true,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

const itemModel = model<ItemAttrs>("Item", itemSchema);

export { itemModel as Item, ItemAttrs };
