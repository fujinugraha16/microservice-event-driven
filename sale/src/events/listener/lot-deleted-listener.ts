import { Message } from "node-nats-streaming";
import { Listener, LotDeletedEvent, Subjects } from "@fujingr/common";
import { queueGroupName } from "../../constants/queue-group-name";

// helpers
import { parseDesignsToItemPayloads } from "@fujingr/common";
import { clearItems } from "../../helpers/clear-items";

export class LotDeletedListener extends Listener<LotDeletedEvent> {
  readonly subject = Subjects.LotDeleted;
  queueGroupName = queueGroupName;

  async onMessage(data: LotDeletedEvent["data"], msg: Message) {
    const { designs } = data;

    const itemPayloads = parseDesignsToItemPayloads(designs);
    await clearItems(itemPayloads);

    msg.ack();
  }
}
