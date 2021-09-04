import { Message } from "node-nats-streaming";
import { Listener, ArticleCreatedEvent, Subjects } from "@fujingr/common";
import { queueGroupName } from "../../constants/queue-group-name";

// models
import { Article } from "../../models/article";

export class ArticleCreatedListener extends Listener<ArticleCreatedEvent> {
  readonly subject = Subjects.ArticleCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: ArticleCreatedEvent["data"], msg: Message) {
    const {
      id,
      code,
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

    const article = new Article({
      _id: id,
      code,
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

    // ack the message
    msg.ack();
  }
}
