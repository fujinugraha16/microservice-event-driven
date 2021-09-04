import { Message } from "node-nats-streaming";
import { Listener, ArticleDeletedEvent, Subjects } from "@fujingr/common";
import { queueGroupName } from "../../constants/queue-group-name";

// models
import { Article } from "../../models/article";

export class ArticleDeletedListener extends Listener<ArticleDeletedEvent> {
  readonly subject = Subjects.ArticleDeleted;
  queueGroupName = queueGroupName;

  async onMessage(data: ArticleDeletedEvent["data"], msg: Message) {
    const { id } = data;

    const article = await Article.findById(id);
    if (!article) {
      throw new Error("Article not found");
    }

    await Article.findByIdAndRemove(id);

    msg.ack();
  }
}
