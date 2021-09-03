import { Subjects } from "../subjects";
import { DesignPayloadEvent } from "./payload";

export interface LotDeletedEvent {
  subject: Subjects.LotDeleted;
  data: {
    article: {
      id: string;
    };
    designs: DesignPayloadEvent[];
  };
}
