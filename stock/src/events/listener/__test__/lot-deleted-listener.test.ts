import { Types } from "mongoose";
import { Message } from "node-nats-streaming";
import { LotDeletedEvent } from "@fujingr/common";

// constants
import { InOut } from "../../../constants/enum-in-out";

// events
jest.mock("../../../nats-wrapper");
import { natsWrapper } from "../../../nats-wrapper";
import { LotDeletedListener } from "../lot-deleted-listener";

// helpers
import { randomString } from "@fujingr/common";

// models
import { Stock } from "../../../models/stock";
import { Item } from "../../../models/item";

const id = new Types.ObjectId().toHexString();
const itemId = new Types.ObjectId().toHexString();
const qrCode = randomString(10);

const setup = async () => {
  const listener = new LotDeletedListener(natsWrapper.client);

  const stock = new Stock({
    article: id,
    name: "Test white",
    color: "#fff",
    totalQty: 100,
    totalLengthInMeters: 910,
    totalLengthInYards: 1000,
    inOutStocks: [
      {
        qrCode,
        info: InOut.IN,
      },
    ],
    detailStocks: [itemId],
  });
  await stock.save();

  const item = new Item({
    id: itemId,
    qrCode,
    lengthInMeters: 40,
    lengthInYards: 50,
  });
  await item.save();

  const data: LotDeletedEvent["data"] = {
    article: {
      id,
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

test("stock successfully to decreased", async () => {
  const { listener, stock, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const existingStock = await Stock.findById(stock.id);
  expect(existingStock!.totalLengthInMeters).toEqual(870);
  expect(existingStock!.totalLengthInYards).toEqual(950);
  expect(existingStock!.totalQty).toEqual(99);
});

test("item successfully deleted", async () => {
  const { listener, item, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const checkItem = await Item.findById(itemId);
  expect(checkItem).toBeNull();
});

test("acks the message", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
