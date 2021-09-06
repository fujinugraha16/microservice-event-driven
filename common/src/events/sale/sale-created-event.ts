import { Subjects } from "../subjects";

import { StockPayload } from "./payload";

export interface SaleCreatedEvent {
  subject: Subjects.SaleCreated;
  data: {
    retailItems?: {
      qrCode: string;
      lengthInMeters: number;
      lengthInYards: number;
      version: number;
    }[];
    wholesalerItems?: {
      qrCode: string;
      version: number;
    }[];
    lotItems?: {
      qrCode: string;
      version: number;
    }[];
    stockPayloads?: StockPayload[];
  };
}
