export interface ClothApiPayloadFromSale {
  retailItems?: {
    qrCode: string;
    lengthInMeters: number;
  }[];
  wholesalerItems?: string[];
  lotItems?: string[];
}
