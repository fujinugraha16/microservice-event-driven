// constants
import { LotItemPayload } from "../constants/lot-item-payload";

// models
import { Item } from "../models/item";

export const lotItemsProcessing = async (lotItems: LotItemPayload[]) => {
  let tempPrice = 0;
  let totalPrice = 0;
  let totalQty = 0;
  const notFoundItemsQrCode: string[] = [];

  const mainPromises = lotItems.map(async ({ price, items }) => {
    const promises = items.map(async ({ qrCode }) => {
      const itemDoc = await Item.findOne({ qrCode });
      if (itemDoc) {
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

  return { totalPrice, totalQty, notFoundItemsQrCode };
};
