import { Message } from "node-nats-streaming";
import { Listener, LotCreatedEvent, Subjects } from "@fujingr/common";
import { queueGroupName } from "../../constants/queue-group-name";

// helpers
import { parseDesignsToStockPayloads } from "../../helpers/parse-designs-to-stock-payloads";
import { parseDesignsToItemPayloads } from "../../helpers/parse-design-to-item-payloads";
import { saveOrIncreaseStocks } from "../../helpers/save-or-increase-stocks";
import { saveItems } from "../../helpers/save-items";

export class LotCreatedListener extends Listener<LotCreatedEvent> {
  readonly subject = Subjects.LotCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: LotCreatedEvent["data"], msg: Message) {
    const { article, designs } = data;

    const stockPayloads = parseDesignsToStockPayloads(designs, article);
    await saveOrIncreaseStocks(stockPayloads);

    const itemPayloads = parseDesignsToItemPayloads(designs);
    await saveItems(itemPayloads);

    msg.ack();
  }
}
