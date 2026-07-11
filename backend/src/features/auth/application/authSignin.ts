import { AuthRepository } from "../domain/auth.repository";
import bcrypt from "bcrypt";
import { RefreshTokenIssuer } from "./refreshTokenIssuer";

export class AuthSignin {
	constructor(
		private readonly authRepository: AuthRepository,
		private readonly tokenIssuer: RefreshTokenIssuer,
	) {}

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

		const checkPassword = await this.comparePassword(password, user.password);

		if (!checkPassword) {
			throw new Error("Invalid email or password");
		}

		const payload = {
			email: user.email,
			id: user._id,
		};

		const { token, refreshToken } = await this.tokenIssuer.issue(payload);

		return {
			user,
			token,
			refreshToken,
		};
	}
}
