import { Types } from "mongoose";
import { Message } from "node-nats-streaming";
import { LotAddItemsEvent } from "@fujingr/common";

// events
jest.mock("../../../nats-wrapper");
import { natsWrapper } from "../../../nats-wrapper";
import { LotAddItemsListener } from "../lot-add-items-listener";

// helpers
import { randomString } from "@fujingr/common";

// models
import { Item } from "../../../models/item";

const setup = () => {
  const listener = new LotAddItemsListener(natsWrapper.client);

  const data: LotAddItemsEvent["data"] = {
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

test("item successfully added", async () => {
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
