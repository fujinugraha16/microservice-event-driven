import { Role } from "./enum-role";

export interface UserPayload {
  id: string;
  username: string;
  role: Role;
}
