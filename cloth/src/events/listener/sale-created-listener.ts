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
    const notFoundQrCodeWithVersion: string[] = [];

    if (retailItems && retailItems.length > 0) {
      const retailItemsPrx = await retailItemsProcessing(retailItems);
      notFoundQrCodeWithVersion.push(
        ...retailItemsPrx.notFoundQrCodeWithVersion
      );
    }

    if (wholesalerItems && wholesalerItems.length > 0) {
      const wholesalerItemsPrx = await wholesalerItemsProcessing(
        wholesalerItems
      );
      notFoundQrCodeWithVersion.push(
        ...wholesalerItemsPrx.notFoundQrCodeWithVersion
      );
    }

    if (lotItems && lotItems.length > 0) {
      const lotItemsPrx = await lotItemsProcessing(lotItems);
      notFoundQrCodeWithVersion.push(...lotItemsPrx.notFoundQrCodeWithVersion);
    }

    if (notFoundQrCodeWithVersion.length === 0) {
      msg.ack();
    }
  }
}
