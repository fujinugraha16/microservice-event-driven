import { Message } from "node-nats-streaming";
import { Listener, SaleCreatedEvent, Subjects } from "@fujingr/common";
import { queueGroupName } from "../../constants/queue-group-name";

// helpers
import { retailItemsProcessing } from "../../helpers/retail-items-processing";
import { wholesalerItemsProcessing } from "../../helpers/wholesaler-items-processing";
import { lotItemsProcessing } from "../../helpers/lot-items-processing";

export class SaleCreatedListener extends Listener<SaleCreatedEvent> {
  readonly subject = Subjects.SaleCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: SaleCreatedEvent["data"], msg: Message) {
    const { retailItems, wholesalerItems, lotItems } = data;

    if (retailItems && retailItems.length > 0) {
      await retailItemsProcessing(retailItems);
    }

    if (wholesalerItems && wholesalerItems.length > 0) {
      await wholesalerItemsProcessing(wholesalerItems);
    }

    if (lotItems && lotItems.length > 0) {
      await lotItemsProcessing(lotItems);
    }

    msg.ack();
  }
}
