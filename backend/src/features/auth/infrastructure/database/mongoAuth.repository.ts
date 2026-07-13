import { AuthRepository, ProfileUpdateData } from "../../domain/auth.repository";
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

  // Unlike `login`, this never throws on a missing user — callers decide how
  // to handle the null case (NotFoundError at the use-case layer).
  async getById(userId: string): Promise<User | null> {
    return UserModel.findById(userId);
  }

  async existsByEmail(email: string): Promise<boolean> {
    return !!(await UserModel.exists({ email }));
  }

  async updateProfile(userId: string, data: ProfileUpdateData): Promise<User | null> {
    return UserModel.findByIdAndUpdate(userId, { $set: data }, { new: true });
  }

  async updatePassword(userId: string, hashedPassword: string): Promise<void> {
    await UserModel.findByIdAndUpdate(userId, { $set: { password: hashedPassword } });
  }
}
