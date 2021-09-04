import { Message } from "node-nats-streaming";
import { Listener, LotDeletedEvent, Subjects } from "@fujingr/common";
import { queueGroupName } from "../../constants/queue-group-name";

// helpers
import { parseDesignsToStockPayloads } from "../../helpers/parse-designs-to-stock-payloads";
import { parseDesignsToItemPayloads } from "../../helpers/parse-design-to-item-payloads";
import { decreaseStocks } from "../../helpers/decrease-stocks";
import { clearItems } from "../../helpers/clear-items";

export class LotDeletedListener extends Listener<LotDeletedEvent> {
  readonly subject = Subjects.LotDeleted;
  queueGroupName = queueGroupName;

  async onMessage(data: LotDeletedEvent["data"], msg: Message) {
    const { article, designs } = data;

    const stockPayloads = parseDesignsToStockPayloads(designs, article);
    await decreaseStocks(stockPayloads);

    const itemPayloads = parseDesignsToItemPayloads(designs);
    await clearItems(itemPayloads);

    msg.ack();
  }
}
