import bcrypt from "bcrypt";
import { Types } from "mongoose";
import { AuthRepository, ProfileUpdateData } from "../src/features/auth/domain/auth.repository";
import { User } from "../src/features/auth/domain/user.entity";

export class InMemoryAuthRepository implements AuthRepository {
  private users: User[] = [];

  async login(email: string): Promise<User> {
    const user = this.users.find((u) => u.email === email);

    if (!user) {
      throw new Error("Invalid email or password");
    }

    return user;
  }

  async register(user: Omit<User, "_id" | "createdAt" | "updatedAt">): Promise<User> {
    const newUser: User = {
      _id: new Types.ObjectId().toString(),
      ...user,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users.push(newUser);

    return newUser;
  }

  async getById(userId: string): Promise<User | null> {
    return this.users.find((u) => u._id === userId) ?? null;
  }

  async existsByEmail(email: string): Promise<boolean> {
    return this.users.some((u) => u.email === email);
  }

  async updateProfile(userId: string, data: ProfileUpdateData): Promise<User | null> {
    const idx = this.users.findIndex((u) => u._id === userId);

    if (idx === -1) {
      return null;
    }

    this.users[idx] = {
      ...this.users[idx],
      ...data,
      updatedAt: new Date(),
    };

    return this.users[idx];
  }

  async updatePassword(userId: string, hashedPassword: string): Promise<void> {
    const idx = this.users.findIndex((u) => u._id === userId);

    if (idx === -1) {
      return;
    }

    this.users[idx] = {
      ...this.users[idx],
      password: hashedPassword,
      updatedAt: new Date(),
    };
  }

  // Test helper: seed a user with a known plaintext password (hashed with the
  // same bcrypt policy as signup) so tests can exercise login/compare flows.
  async seedUser(overrides: Partial<User> & { plainPassword?: string } = {}): Promise<User> {
    const { plainPassword = "password123", ...rest } = overrides;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);

    const user: User = {
      _id: new Types.ObjectId().toString(),
      email: "user@example.com",
      password: hashedPassword,
      name: "Jane",
      surename: "M",
      lastname: "Doe",
      createdAt: new Date(),
      updatedAt: new Date(),
      ...rest,
      password: rest.password ?? hashedPassword,
    };

    this.users.push(user);

    return user;
  }
}
