// models
import { Item } from "../models/item";

// events
import { SaleCreatedEvent } from "@fujingr/common";

export const wholesalerItemsProcessing = async (
  wholesalerItems: SaleCreatedEvent["data"]["wholesalerItems"]
) => {
  const promises = wholesalerItems!.map(async (qrCode) => {
    const itemDoc = await Item.findOne({ qrCode });
    if (itemDoc) {
      itemDoc.set({
        lengthInMeters: 0,
        lengthInYards: 0,
        sold: true,
      });
      await itemDoc.save();
    }
  });
  await Promise.all(promises);
};
