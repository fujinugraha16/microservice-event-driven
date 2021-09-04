import { Types } from "mongoose";
import { Message } from "node-nats-streaming";
import { ArticleUpdatedEvent } from "@fujingr/common";

// constants
import { TypeOfSale } from "@fujingr/common";

// helpers
import { randomString } from "@fujingr/common";

// events
import { natsWrapper } from "../../../nats-wrapper";
import { ArticleUpdatedListener } from "../article-updated-listener";

// models
import { Article } from "../../../models/article";

const setup = async () => {
  const listener = new ArticleUpdatedListener(natsWrapper.client);

  const article = new Article({
    id: new Types.ObjectId().toHexString(),
    code: randomString(5),
    gsm: 10,
    name: "Test A",
    safetyStock: 20,
    typeOfSale: TypeOfSale.lot,
    width: 100,
  });
  await article.save();

  const data: ArticleUpdatedEvent["data"] = {
    id: article.id,
    gsm: 20,
    name: "Test B",
    safetyStock: 30,
    typeOfSale: TypeOfSale.retail,
    width: 120,
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, article, data, msg };
};

test("article successfully updated", async () => {
  const { listener, article, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const existingArticle = await Article.findById(article.id);

  expect(article.name).not.toEqual(existingArticle!.name);
});

test("acks the message", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
