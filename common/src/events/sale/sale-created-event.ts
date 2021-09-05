import { Subjects } from "../subjects";

import { StockPayload } from "./payload";

export interface SaleCreatedEvent {
  subject: Subjects.SaleCreated;
  data: {
    retailItems?: {
      qrCode: string;
      lengthInMeters: number;
      lengthInYards: number;
    }[];
    wholesalerItems?: string[];
    lotItems?: string[];
    stockPayloads?: StockPayload[];
  };
}
