import { Types } from "mongoose";

// helpers
import { DesignPayloadEvent, ItemPayloadEvent } from "@fujingr/common";

// models
import { Design } from "../models/design";
import { Item } from "../models/item";

export const parseLotDesigns = async (
  designIds: string[] | Types.ObjectId[],
  inputSequence?: number
): Promise<DesignPayloadEvent[]> => {
  const designPromises = designIds.map(async (designId) => {
    const designDoc = await Design.findById(designId).select(
      "code name color items"
    );

    const itemPromises = designDoc!.items.map(async (item) => {
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

    const updatedItems = inputSequence
      ? (await Promise.all(itemPromises)).filter((item) =>
          item.qrCode.includes(`${designDoc!.code}-${inputSequence}`)
        )
      : await Promise.all(itemPromises);

    const updatedDesign: DesignPayloadEvent = {
      name: designDoc!.name,
      color: designDoc!.color,
      items: updatedItems,
    };

    return updatedDesign;
  });

  return Promise.all(designPromises);
};
