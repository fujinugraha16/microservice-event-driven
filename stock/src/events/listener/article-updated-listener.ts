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
      version,
    } = data;

    let callMsgAck = true;

    const article = await Article.findOne({ _id: id, version: version - 1 });
    if (article) {
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
    } else {
      // maybe has been deleted or not defined
      const checkAvailabilityArticle = await Article.findById(id);
      if (checkAvailabilityArticle) {
        callMsgAck = false;
        console.log(
          `Article with id: '${id}', and version: ${version - 1} not found`
        );
      } else {
        callMsgAck = true;
      }
    }

    if (callMsgAck) {
      msg.ack();
    }
  }
}
