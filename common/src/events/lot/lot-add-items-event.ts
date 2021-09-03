import { Subjects } from "../subjects";
import { DesignPayloadEvent } from "./payload";

export interface LotAddItemsEvent {
  subject: Subjects.LotAddItems;
  data: {
    article: {
      id: string;
      name: string;
    };
    designs: DesignPayloadEvent[];
  };
}
