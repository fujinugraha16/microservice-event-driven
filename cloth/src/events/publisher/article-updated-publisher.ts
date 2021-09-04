import { Publisher, ArticleUpdatedEvent, Subjects } from "@fujingr/common";

export class ArticleUpdatedPublisher extends Publisher<ArticleUpdatedEvent> {
  readonly subject = Subjects.ArticleUpdated;
}
