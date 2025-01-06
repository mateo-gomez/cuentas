import { User } from "./User";

export interface Auth {
  user: User;
  token: string;
}
