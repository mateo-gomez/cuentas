import { User } from "./user.entity";

export interface AuthRepository {
  login(email: string): Promise<User>;
  register(
    user: Omit<User, "_id" | "createdAt" | "updatedAt">,
  ): Promise<User>;
}
