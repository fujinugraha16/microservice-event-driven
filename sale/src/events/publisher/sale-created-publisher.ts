import { Publisher, SaleCreatedEvent, Subjects } from "@fujingr/common";

export class SaleCreatedPublisher extends Publisher<SaleCreatedEvent> {
  readonly subject = Subjects.SaleCreated;
}
