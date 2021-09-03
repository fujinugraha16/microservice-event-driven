import { Subjects } from "../subjects";
import { DesignPayloadEvent } from "./payload";

export interface LotCreatedEvent {
  subject: Subjects.LotCreated;
  data: {
    article: {
      id: string;
      name: string;
    };
    designs: DesignPayloadEvent[];
  };
}
