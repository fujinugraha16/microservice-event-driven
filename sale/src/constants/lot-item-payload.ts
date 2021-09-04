interface ItemPayload {
  qrCode: string;
  lengthInMeters: number;
  lengthInYards: number;
}

export interface LotItemPayload {
  price: number;
  items: ItemPayload[];
}
