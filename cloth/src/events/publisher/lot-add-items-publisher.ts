import { Publisher, LotAddItemsEvent, Subjects } from "@fujingr/common";

export class LotAddItemsPublisher extends Publisher<LotAddItemsEvent> {
  readonly subject = Subjects.LotAddItems;
}
