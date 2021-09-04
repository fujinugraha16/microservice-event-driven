import { Types } from "mongoose";
import { Message } from "node-nats-streaming";
import { ArticleCreatedEvent } from "@fujingr/common";

// constants
import { TypeOfSale } from "@fujingr/common";

// helpers
import { randomString } from "@fujingr/common";

// events
import { natsWrapper } from "../../../nats-wrapper";
import { ArticleCreatedListener } from "../article-created-listener";

// models
import { Article } from "../../../models/article";

const setup = () => {
  // create instance of the listener
  const listener = new ArticleCreatedListener(natsWrapper.client);

  // create the fake data event
  const data: ArticleCreatedEvent["data"] = {
    id: new Types.ObjectId().toHexString(),
    code: randomString(5),
    gsm: 10,
    name: "Test",
    safetyStock: 20,
    typeOfSale: TypeOfSale.lot,
    width: 100,
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg };
};

test("article successfully created", async () => {
  const { listener, data, msg } = setup();

  await listener.onMessage(data, msg);

  const article = await Article.findById(data.id);

  expect(article).not.toBeNull();
  expect(article!.code).toEqual(data.code);
});

test("acks the message", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
