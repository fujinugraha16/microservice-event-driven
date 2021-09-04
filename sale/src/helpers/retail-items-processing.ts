// constants
import { RetailItemPayload } from "../constants/retail-item-payload";

// models
import { Item } from "../models/item";

export const retailItemsProcessing = async (
  retailItems: RetailItemPayload[]
) => {
  let tempPrice = 0;
  let totalPrice = 0;
  let totalQty = 0;
  const notFoundItemsQrCode: string[] = [];

  const promises = retailItems.map(
    async ({ qrCode, price, lengthInMeters }) => {
      // let stockQty = 0;
      tempPrice += price;

      const itemDoc = await Item.findOne({ qrCode });
      if (itemDoc) {
        const totalLengthInMeters = itemDoc.lengthInMeters - lengthInMeters;
        const totalLengthInYards =
          (itemDoc.lengthInMeters - lengthInMeters) * 1.09;

        if (totalLengthInYards < 0) {
          itemDoc.set({
            lengthInMeters: 0,
            lengthInYards: 0,
          });
          await itemDoc.save();

          // stockQty = 1;
        } else {
          itemDoc.set({
            lengthInMeters: totalLengthInMeters,
            lengthInYards: totalLengthInYards,
          });
          await itemDoc.save();
        }
      } else {
        notFoundItemsQrCode.push(qrCode);
      }
    }
  );
  await Promise.all(promises);

  totalPrice += tempPrice;
  totalQty += retailItems.length;

  return { totalPrice, totalQty, notFoundItemsQrCode };
};
