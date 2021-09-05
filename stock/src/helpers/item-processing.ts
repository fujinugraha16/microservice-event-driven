import { Item } from "../models/item";

interface ItemPayload {
  itemId: string;
  lengthInMeters: number;
  lengthInYards: number;
}

export const itemProcessing = async (itemPayload: ItemPayload) => {
  const { itemId, lengthInMeters, lengthInYards } = itemPayload;
  let sold = false;

  const itemDoc = await Item.findById(itemId);
  if (itemDoc) {
    const totalLengthInMeters = itemDoc.lengthInMeters - lengthInMeters;
    const totalLengthInYards = itemDoc.lengthInYards - lengthInYards;

    if (totalLengthInMeters < 0 || totalLengthInYards < 0) {
      itemDoc.set({
        lengthInMeters: 0,
        lengthInYards: 0,
      });
      await itemDoc.save();

      sold = true;
    } else {
      itemDoc.set({
        lengthInMeters: totalLengthInMeters,
        lengthInYards: totalLengthInYards,
      });
      await itemDoc.save();
    }
  }

  return { sold, qrCode: itemDoc?.qrCode || null };
};
