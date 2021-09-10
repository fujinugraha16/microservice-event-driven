import { Types } from "mongoose";
import { Message } from "node-nats-streaming";
import { LotCreatedEvent } from "@fujingr/common";

// constants
import { InOut } from "../../../constants/enum-in-out";

// events
jest.mock("../../../nats-wrapper");
import { natsWrapper } from "../../../nats-wrapper";
import { LotCreatedListener } from "../lot-created-listener";

// helpers
import { randomString } from "@fujingr/common";

// models
import { Stock } from "../../../models/stock";
import { Item } from "../../../models/item";

const id = new Types.ObjectId().toHexString();

const setup = async (id?: string) => {
  const listener = new LotCreatedListener(natsWrapper.client);

  const stock = new Stock({
    article: id,
    name: "Test white",
    color: "#fff",
    totalQty: 100,
    totalLengthInMeters: 910,
    totalLengthInYards: 1000,
    inOutStocks: [
      {
        qrCode: randomString(10),
        info: InOut.IN,
      },
    ],
    detailStocks: [new Types.ObjectId().toHexString()],
  });
  await stock.save();

  const data: LotCreatedEvent["data"] = {
    article: {
      id: id || new Types.ObjectId().toHexString(),
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

  return { listener, stock, data, msg };
};

test("stock successfully to created", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const totalStockDocs = await Stock.find().countDocuments();
  expect(totalStockDocs).toEqual(2);
});

test("stock successfully to increased", async () => {
  const { listener, stock, data, msg } = await setup(id);

  await listener.onMessage(data, msg);

  const existingStock = await Stock.findById(stock.id);
  expect(existingStock!.totalLengthInMeters).toEqual(950);
  expect(existingStock!.totalLengthInYards).toEqual(1050);
  expect(existingStock!.totalQty).toEqual(101);
});

test("item successfully created", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const totalItems = await Item.find().countDocuments();
  expect(totalItems).toEqual(1);
});

test("acks the message", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
