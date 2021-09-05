// constants
import { WholesalerItemPayload } from "../constants/wholesaler-item-payload";

// models
import { Item } from "../models/item";

// events
import { StockPayload } from "@fujingr/common";

export const wholesalerItemsProcessing = async (
  wholesalerItems: WholesalerItemPayload[]
) => {
  let tempPrice = 0;
  let totalPrice = 0;
  let totalQty = 0;
  const notFoundItemsQrCode: string[] = [];
  const stockPayloads: StockPayload[] = [];

  const promises = wholesalerItems.map(async ({ qrCode, price }) => {
    tempPrice += price;

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

  totalPrice += tempPrice;
  totalQty += wholesalerItems.length;

  return { totalPrice, totalQty, notFoundItemsQrCode, stockPayloads };
};
