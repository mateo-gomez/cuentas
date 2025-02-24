import config from "../../../config/config";
import jwt from "jsonwebtoken";
import { UserLogged } from "../../infrastructure/types/UserLogged";

export class AuthService {
	private secretKey: string;

	constructor() {
		this.secretKey = config.JWT_SECRET || "tu_clave_secreta";
	}

	generateToken(payload: UserLogged, expiresIn = "1h") {
		return jwt.sign(payload, this.secretKey, { expiresIn });
	}

	verifyToken(token: string): UserLogged | null {
		try {
			const decode = jwt.verify(token, this.secretKey);

			return decode as UserLogged;
		} catch (error) {
			return null;
		}
	}
}
