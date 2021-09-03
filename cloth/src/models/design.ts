import { Schema, model, Types } from "mongoose";

interface DesignAttrs {
  code: string;
  name: string;
  color: string;
  items: Types.ObjectId[];
  lot: Types.ObjectId;
}

const designSchema = new Schema<DesignAttrs>(
  {
    code: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
    items: [
      {
        type: Schema.Types.ObjectId,
        ref: "Item",
      },
    ],
    lot: {
      type: Schema.Types.ObjectId,
      ref: "Lot",
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

const designModel = model<DesignAttrs>("Design", designSchema);

export { designModel as Design, DesignAttrs };
