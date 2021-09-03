import { Gender, TypeOfSale } from "../../constants";
import { Subjects } from "../subjects";

export interface ArticleUpdatedEvent {
  subject: Subjects.ArticleUpdated;
  data: {
    id: string;
    name: string;
    width: number;
    departments?: string[];
    genders?: Gender[];
    activities?: string[];
    gsm: number;
    safetyStock: number;
    typeOfSale: TypeOfSale;
    detailReferences?: string[];
  };
}
