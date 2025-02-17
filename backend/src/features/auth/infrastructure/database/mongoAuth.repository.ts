import { AuthRepository } from "../../domain/auth.repository";
import { User } from "../../domain/user.entity";
import { UserModel } from "./User";

export class MongoAuthRepository implements AuthRepository {
  async login(email: string): Promise<User> {
    const user = await UserModel.findOne({ email });

    if (!user) {
      throw new Error("Invalid email or password");
    }

    return user;
  }

  async register(
    user: Omit<User, "_id" | "createdAt" | "updatedAt">,
  ): Promise<User> {
    const newUser = await UserModel.create(user);

    return newUser;
  }
}
