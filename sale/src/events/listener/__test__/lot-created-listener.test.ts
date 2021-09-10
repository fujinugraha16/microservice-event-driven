import { Types } from "mongoose";
import { Message } from "node-nats-streaming";
import { LotCreatedEvent } from "@fujingr/common";

// events
jest.mock("../../../nats-wrapper");
import { natsWrapper } from "../../../nats-wrapper";
import { LotCreatedListener } from "../lot-created-listener";

// helpers
import { randomString } from "@fujingr/common";

// models
import { Item } from "../../../models/item";

const setup = () => {
  const listener = new LotCreatedListener(natsWrapper.client);

  const data: LotCreatedEvent["data"] = {
    article: {
      id: new Types.ObjectId().toHexString(),
      name: "Test",
    },
    designs: [
      {
        color: "#fff",
        name: "white",
        items: [
          {
            id: new Types.ObjectId().toHexString(),
            qrCode: randomString(10),
            lengthInMeters: 40,
            lengthInYards: 50,
          },
        ],
      },
    ],
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg };
};

test("item successfully created", async () => {
  const { listener, data, msg } = setup();

  await listener.onMessage(data, msg);

  const totalItems = await Item.find().countDocuments();
  expect(totalItems).toEqual(1);
});

test("acks the message", async () => {
  const { listener, data, msg } = setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
