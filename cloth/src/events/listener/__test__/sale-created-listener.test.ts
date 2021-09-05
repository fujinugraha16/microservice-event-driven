import { Types } from "mongoose";
import { Message } from "node-nats-streaming";
import { SaleCreatedEvent } from "@fujingr/common";

// events
import { natsWrapper } from "../../../nats-wrapper";
import { SaleCreatedListener } from "../sale-created-listener";

// helpers
import { randomString } from "@fujingr/common";
import { createItem } from "../../../helpers/item-test";

// models
import { Item } from "../../../models/item";

const qrCode1 = randomString(5);
const qrCode2 = randomString(5);
const qrCode3 = randomString(5);

const setup = async () => {
  const listener = new SaleCreatedListener(natsWrapper.client);

  await createItem(qrCode1);
  await createItem(qrCode2);
  await createItem(qrCode2);

  const data: SaleCreatedEvent["data"] = {
    retailItems: [
      {
        qrCode: qrCode1,
        lengthInMeters: 10,
        lengthInYards: 10 * 1.09,
      },
    ],
    wholesalerItems: [qrCode2],
    lotItems: [qrCode3],
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg };
};

test("item successfully to updated", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const existingItem1 = await Item.findOne({ qrCode: qrCode1 });
  const existingItem2 = await Item.findOne({ qrCode: qrCode2 });
  const existingItem3 = await Item.findOne({ qrCode: qrCode3 });

  expect(existingItem1!.lengthInMeters).toEqual(40 - 10);
  expect(existingItem1!.lengthInYards).toEqual(40 - 10 * 1.09);

  expect(existingItem2!.lengthInMeters).toEqual(0);
  expect(existingItem2!.lengthInYards).toEqual(0);
  expect(existingItem2!.sold).toEqual(true);

  expect(existingItem3!.lengthInMeters).toEqual(0);
  expect(existingItem3!.lengthInYards).toEqual(0);
  expect(existingItem3!.sold).toEqual(true);
});

test("acks the message", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
