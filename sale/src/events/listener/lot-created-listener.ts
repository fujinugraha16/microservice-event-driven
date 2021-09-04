import { Message } from "node-nats-streaming";
import { Listener, LotCreatedEvent, Subjects } from "@fujingr/common";
import { queueGroupName } from "../../constants/queue-group-name";

// helpers
import { parseDesignsToItemPayloads } from "@fujingr/common";
import { saveItems } from "../../helpers/save-items";

export class LotCreatedListener extends Listener<LotCreatedEvent> {
  readonly subject = Subjects.LotCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: LotCreatedEvent["data"], msg: Message) {
    const { designs } = data;

    const itemPayloads = parseDesignsToItemPayloads(designs);
    await saveItems(itemPayloads);

    msg.ack();
  }
}
