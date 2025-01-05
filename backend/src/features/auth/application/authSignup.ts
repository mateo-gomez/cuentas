import { bcrypt } from "../../../../deps.ts";
import { AuthRepository } from "../domain/auth.repository.ts";
import { User } from "../domain/user.entity.ts";

export class AuthSignup {
  constructor(
    private readonly authRepository: AuthRepository,
  ) {
  }

  async execute(
    user: Omit<User, "_id" | "createdAt" | "updatedAt">,
    password: string,
  ) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user.password = hashedPassword;

    return await this.authRepository.register(
      user,
    );
  }
}
