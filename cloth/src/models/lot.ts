import { Schema, model, Types, PopulatedDoc, Document } from "mongoose";

interface LotAttrs {
  code: string;
  pureLotCode: string;
  article: PopulatedDoc<Document>;
  designs: PopulatedDoc<Document>;
  supplier: string;
  price?: Types.ObjectId;
  inputSequence: number;
  removable?: Boolean;
}

const lotSchema = new Schema<LotAttrs>(
  {
    code: {
      type: String,
      required: true,
    },
    pureLotCode: {
      type: String,
      required: true,
    },
    article: {
      type: Schema.Types.ObjectId,
      ref: "Article",
    },
    designs: [
      {
        type: String,
        ref: "Design",
      },
    ],
    supplier: {
      type: String,
      required: true,
    },
    price: {
      type: Schema.Types.ObjectId,
      ref: "Price",
    },
    inputSequence: {
      type: Number,
      default: 1,
    },
    // add-ons
    removable: {
      type: Boolean,
      default: true,
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

const lotModel = model<LotAttrs>("Lot", lotSchema);

export { lotModel as Lot, LotAttrs };
