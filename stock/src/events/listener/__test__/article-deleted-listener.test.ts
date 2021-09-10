import { Types } from "mongoose";
import { Message } from "node-nats-streaming";
import { ArticleDeletedEvent } from "@fujingr/common";

// constants
import { TypeOfSale } from "@fujingr/common";

// helpers
import { randomString } from "@fujingr/common";

// events
jest.mock("../../../nats-wrapper");
import { natsWrapper } from "../../../nats-wrapper";
import { ArticleDeletedListener } from "../article-deleted-listener";

// models
import { Article } from "../../../models/article";

const setup = async () => {
  const listener = new ArticleDeletedListener(natsWrapper.client);

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

  const data: ArticleDeletedEvent["data"] = { id: article.id.toString() };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, article, data, msg };
};

test("article successfully deleted", async () => {
  const { listener, article, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const checkArticle = await Article.findById(article.id);

  expect(checkArticle).toBeNull();
});

test("acks the message", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
