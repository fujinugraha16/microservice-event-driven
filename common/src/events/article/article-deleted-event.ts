import { Subjects } from "../subjects";

export interface ArticleDeletedEvent {
  subject: Subjects.ArticleDeleted;
  data: {
    id: string;
  };
}
