import { bcrypt } from "../../../../deps";
import { AuthRepository } from "../domain/auth.repository";
import { User } from "../domain/user.entity";

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
