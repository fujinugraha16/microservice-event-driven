import { Types } from "mongoose";
import { Message } from "node-nats-streaming";
import { SaleCreatedEvent } from "@fujingr/common";

// events
import { natsWrapper } from "../../../nats-wrapper";
import { SaleCreatedListener } from "../sale-created-listener";

// models
import { Stock } from "../../../models/stock";
import { Item } from "../../../models/item";

// helpers
import { randomString } from "@fujingr/common";
import { createItem } from "../../../helpers/item-test";

// constants
import { InOut } from "../../../constants/enum-in-out";

const articleId = new Types.ObjectId().toHexString();
const qrCode1 = randomString(5);
const qrCode2 = randomString(5);
const qrCode3 = randomString(5);

const setup = async () => {
  const listener = new SaleCreatedListener(natsWrapper.client);

  const item1 = await createItem(qrCode1);
  const item2 = await createItem(qrCode2);
  const item3 = await createItem(qrCode3);

  const stock = new Stock({
    article: articleId,
    name: "Test white",
    color: "#fff",
    totalQty: 100,
    totalLengthInMeters: 900,
    totalLengthInYards: 1000,
    inOutStocks: [
      {
        qrCode: qrCode1,
        info: InOut.IN,
      },
      {
        qrCode: qrCode2,
        info: InOut.IN,
      },
      {
        qrCode: qrCode3,
        info: InOut.IN,
      },
    ],
    detailStocks: [item1.id, item2.id, item3.id],
  });
  await stock.save();

  const data: SaleCreatedEvent["data"] = {
    stockPayloads: [
      {
        itemId: item2.id,
        lengthInMeters: 40,
        lengthInYards: 40 * 1.09,
        qty: 1,
      },
      {
        itemId: item3.id,
        lengthInMeters: 40,
        lengthInYards: 40 * 1.09,
        qty: 1,
      },
    ],
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, stock, data, msg };
};

test("items sucessfully updated", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const existingItem2 = await Item.findOne({ qrCode: qrCode2 });
  const existingItem3 = await Item.findOne({ qrCode: qrCode3 });

  expect(existingItem2!.lengthInMeters).toEqual(0);
  expect(existingItem2!.lengthInYards).toEqual(0);

  expect(existingItem3!.lengthInMeters).toEqual(0);
  expect(existingItem3!.lengthInYards).toEqual(0);
});

test("stocks successfully updated", async () => {
  const { listener, stock, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const existingStock = await Stock.findById(stock.id);

  expect(existingStock!.totalLengthInMeters).toEqual(
    stock.totalLengthInMeters - 80
  );
  expect(existingStock!.totalLengthInYards).toEqual(
    stock.totalLengthInYards - 2 * 40 * 1.09
  );
  expect(existingStock!.totalQty).toEqual(1);
});

test("acks the message", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
