import { User } from "./user.entity";

export type ProfileUpdateData = Pick<User, "name" | "surename" | "lastname">;

export interface AuthRepository {
  login(email: string): Promise<User>;
  register(
    user: Omit<User, "_id" | "createdAt" | "updatedAt">,
  ): Promise<User>;
  getById(userId: string): Promise<User | null>;
  existsByEmail(email: string): Promise<boolean>;
  updateProfile(userId: string, data: ProfileUpdateData): Promise<User | null>;
  updatePassword(userId: string, hashedPassword: string): Promise<void>;
}
