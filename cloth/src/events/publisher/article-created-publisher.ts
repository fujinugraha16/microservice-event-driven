import { Publisher, ArticleCreatedEvent, Subjects } from "@fujingr/common";

export class ArticleCreatedPublisher extends Publisher<ArticleCreatedEvent> {
  readonly subject = Subjects.ArticleCreated;
}
