import { Message } from "node-nats-streaming";
import { Listener, ArticleUpdatedEvent, Subjects } from "@fujingr/common";
import { queueGroupName } from "../../constants/queue-group-name";

// models
import { Article } from "../../models/article";

export class ArticleUpdatedListener extends Listener<ArticleUpdatedEvent> {
  readonly subject = Subjects.ArticleUpdated;
  queueGroupName = queueGroupName;

  async onMessage(data: ArticleUpdatedEvent["data"], msg: Message) {
    const {
      id,
      gsm,
      name,
      safetyStock,
      typeOfSale,
      width,
      activities,
      departments,
      genders,
      detailReferences,
    } = data;

    const article = await Article.findById(id);
    if (!article) {
      throw new Error("Article not found");
    }

    article.set({
      _id: id,
      gsm,
      name,
      safetyStock,
      typeOfSale,
      width,
      activities,
      departments,
      genders,
      detailReferences,
    });
    await article.save();

    msg.ack();
  }
}
