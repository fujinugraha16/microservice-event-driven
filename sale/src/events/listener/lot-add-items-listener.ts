import { Message } from "node-nats-streaming";
import { Listener, LotAddItemsEvent, Subjects } from "@fujingr/common";
import { queueGroupName } from "../../constants/queue-group-name";

// helpers
import { parseDesignsToItemPayloads } from "@fujingr/common";
import { saveItems } from "../../helpers/save-items";

export class LotAddItemsListener extends Listener<LotAddItemsEvent> {
  readonly subject = Subjects.LotAddItems;
  queueGroupName = queueGroupName;

  async onMessage(data: LotAddItemsEvent["data"], msg: Message) {
    const { designs } = data;

    const itemPayloads = parseDesignsToItemPayloads(designs);
    await saveItems(itemPayloads);

    msg.ack();
  }
}
