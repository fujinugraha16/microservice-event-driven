import { Publisher, LotDeletedEvent, Subjects } from "@fujingr/common";

export class LotDeletedPublisher extends Publisher<LotDeletedEvent> {
  readonly subject = Subjects.LotDeleted;
}
