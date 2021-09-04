import { Publisher, ArticleDeletedEvent, Subjects } from "@fujingr/common";

export class ArticleDeletedPublisher extends Publisher<ArticleDeletedEvent> {
  readonly subject = Subjects.ArticleDeleted;
}
