import { Types } from "mongoose";
import { Message } from "node-nats-streaming";
import { LotDeletedEvent } from "@fujingr/common";

// events
import { natsWrapper } from "../../../nats-wrapper";
import { LotDeletedListener } from "../lot-deleted-listener";

// helpers
import { randomString } from "@fujingr/common";

// models
import { Item } from "../../../models/item";

const itemId = new Types.ObjectId().toHexString();
const qrCode = randomString(10);

const setup = async () => {
  const listener = new LotDeletedListener(natsWrapper.client);

  const item = new Item({
    id: itemId,
    qrCode,
    lengthInMeters: 40,
    lengthInYards: 50,
  });
  await item.save();

  const data: LotDeletedEvent["data"] = {
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
            id: itemId,
            qrCode,
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

  return { listener, item, stock, data, msg };
};

test("item successfully deleted", async () => {
  const { listener, item, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const checkItem = await Item.findById(item.id);
  expect(checkItem).toBeNull();
});

test("acks the message", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
