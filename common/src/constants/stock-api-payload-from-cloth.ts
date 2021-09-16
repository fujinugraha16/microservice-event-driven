export interface ItemPayload {
  id: string;
  qrCode: string;
  lengthInMeters: number;
  lengthInYards: number;
}

export interface DesignPayload {
  name: string;
  color: string;
  items: ItemPayload[];
}

export interface StockApiPayloadFromCloth {
  article: {
    id: string;
    name: string;
  };
  designs: DesignPayload[];
}
