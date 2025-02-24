import config from "../../../../config/config";
import { AuthRepository } from "../domain/auth.repository";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { AuthService } from "../../../application/services/auth.service";

export class AuthSignin {
	private secret: string;

	constructor(
		private readonly authRepository: AuthRepository,
		private readonly authService: AuthService
	) {
		this.secret = config.JWT_SECRET || "";
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

		const payload = {
			email: user.email,
			id: user._id,
		};

		const token = await this.authService.generateToken(payload);

		return {
			user,
			token,
		};
	}
}
