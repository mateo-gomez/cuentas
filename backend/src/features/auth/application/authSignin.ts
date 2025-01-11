import config from "../../../../config/config";
import { bcrypt } from "../../../../deps";
import { jwtVerify } from "../../../../deps";
import { JWTPayload, SignJWT } from "../../../../deps";
import { AuthRepository } from "../domain/auth.repository";

export class AuthSignin {
  private secret: Uint8Array;

  constructor(
    private readonly authRepository: AuthRepository,
  ) {
    this.secret = new TextEncoder().encode(config.JWT_SECRET);
  }

  async createJWT(payload: JWTPayload) {
    const jwt = await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(this.secret);

    return jwt;
  }

  async verifyJWT(token: string) {
    try {
      const { payload } = await jwtVerify(token, this.secret);
      return payload;
    } catch (error) {
      console.error("Invalid JWT", error);
      return null;
    }
  }

  private comparePassword(password: string, hash: string) {
    return bcrypt.compare(password, hash);
  }

  async execute(email: string, password: string) {
    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    const user = await this.authRepository.login(email);

    if (!user) {
      throw new Error("Invalid email or password");
    }

    const checkPassword = this.comparePassword(password, user.password);

    if (!checkPassword) {
      throw new Error("Invalid email or password");
    }

    const payload: JWTPayload = {
      email: user.email,
      id: user._id,
    };

    const token = await this.createJWT(payload);

    return {
      user,
      token,
    };
  }
}
