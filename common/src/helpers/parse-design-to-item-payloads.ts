import { DesignPayloadEvent, ItemPayloadEvent } from "../events/lot/payload";

export const parseDesignsToItemPayloads = (designs: DesignPayloadEvent[]) => {
  const itemPayloads: ItemPayloadEvent[] = [];

  for (let i = 0; i < designs.length; i++) {
    itemPayloads.push(...designs[i].items);
  }

  return itemPayloads;
};
