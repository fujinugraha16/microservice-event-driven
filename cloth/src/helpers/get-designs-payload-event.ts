import { Types } from "mongoose";

// helpers
import { DesignPayloadEvent, ItemPayloadEvent } from "@fujingr/common";

// models
import { Design } from "../models/design";
import { Item } from "../models/item";

export const getDesignsPayloadEvent = async (
  designIds: string[] | Types.ObjectId[]
): Promise<DesignPayloadEvent[]> => {
  const designPromises = designIds.map(async (designId) => {
    const designDoc = await Design.findById(designId).select(
      "-_id name color items"
    );

    const itemPromises = await designDoc!.items.map(async (item) => {
      const itemDoc = await Item.findById(item).select(
        "lengthInMeters lengthInYards qrCode"
      );

      const updatedItem: ItemPayloadEvent = {
        id: itemDoc!.id,
        qrCode: itemDoc!.qrCode,
        lengthInMeters: itemDoc!.lengthInMeters,
        lengthInYards: itemDoc!.lengthInYards,
      };

      return updatedItem;
    });

    const updatedDesign: DesignPayloadEvent = {
      name: designDoc!.name,
      color: designDoc!.color,
      items: await Promise.all(itemPromises),
    };

    return updatedDesign;
  });

  return Promise.all(designPromises);
};
