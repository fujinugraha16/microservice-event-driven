import { Message } from "node-nats-streaming";
import { Listener, LotAddItemsEvent, Subjects } from "@fujingr/common";
import { queueGroupName } from "../../constants/queue-group-name";

// helpers
import { parseDesignsToItemPayloads } from "../../helpers/parse-design-to-item-payloads";
import { parseDesignsToStockPayloads } from "../../helpers/parse-designs-to-stock-payloads";
import { saveOrIncreaseStocks } from "../../helpers/save-or-increase-stocks";
import { saveItems } from "../../helpers/save-items";

export class LotAddItemsListener extends Listener<LotAddItemsEvent> {
  readonly subject = Subjects.LotAddItems;
  queueGroupName = queueGroupName;

  async onMessage(data: LotAddItemsEvent["data"], msg: Message) {
    const { article, designs } = data;

    const stockPayloads = parseDesignsToStockPayloads(designs, article);
    await saveOrIncreaseStocks(stockPayloads);

    const itemPayloads = parseDesignsToItemPayloads(designs);
    await saveItems(itemPayloads);

    msg.ack();
  }
}
