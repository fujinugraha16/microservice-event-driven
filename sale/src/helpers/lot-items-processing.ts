// constants
import { LotItemPayload } from "../constants/lot-item-payload";

// models
import { Item } from "../models/item";

// event
import { StockPayload } from "@fujingr/common";

export const lotItemsProcessing = async (lotItems: LotItemPayload[]) => {
  let tempPrice = 0;
  let totalPrice = 0;
  let totalQty = 0;
  const notFoundItemsQrCode: string[] = [];
  const stockPayloads: StockPayload[] = [];

  const mainPromises = lotItems.map(async ({ price, items }) => {
    const promises = items.map(async (qrCode) => {
      const itemDoc = await Item.findOne({ qrCode });
      if (itemDoc) {
        stockPayloads.push({
          itemId: itemDoc.id.toString(),
          lengthInMeters: itemDoc.lengthInMeters,
          lengthInYards: itemDoc.lengthInYards,
          qty: 1,
        });

        itemDoc.set({
          lengthInMeters: 0,
          lengthInYards: 0,
        });
        await itemDoc.save();
      } else {
        notFoundItemsQrCode.push(qrCode);
      }
    });
    await Promise.all(promises);

    tempPrice += price;
  });
  await Promise.all(mainPromises);

  totalPrice += tempPrice;
  totalQty += lotItems.length;

  return { totalPrice, totalQty, notFoundItemsQrCode, stockPayloads };
};
