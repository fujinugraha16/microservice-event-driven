import { Gender, TypeOfSale } from "../../constants";
import { Subjects } from "../subjects";

export interface ArticleCreatedEvent {
  subject: Subjects.ArticleCreated;
  data: {
    id: string;
    code: string;
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
