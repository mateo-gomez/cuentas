import config from "../../../../config/config";
import { AuthRepository } from "../domain/auth.repository";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export class AuthSignin {
	private secret: string;

	constructor(private readonly authRepository: AuthRepository) {
		this.secret = config.JWT_SECRET || "";
	}

	async createJWT(payload: Record<string, any>) {
		const jsonWebToken = jwt.sign({ payload }, this.secret, {
			expiresIn: "24h",
		});

		return jsonWebToken;
	}

	async verifyJWT(token: string) {
		try {
			const payload = jwt.verify(token, this.secret);
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

		const payload = {
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
function jwtVerify(
	token: string,
	secret: Uint8Array<ArrayBufferLike>
): { payload: any } | PromiseLike<{ payload: any }> {
	throw new Error("Function not implemented.");
}
