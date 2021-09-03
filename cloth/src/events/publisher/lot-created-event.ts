import { Publisher, LotCreatedEvent, Subjects } from "@fujingr/common";

export class LotCreatedPublisher extends Publisher<LotCreatedEvent> {
  readonly subject = Subjects.LotCreated;
}
