import config from "../../../config/config";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { UserLogged } from "../../infrastructure/types/UserLogged";

export class AuthService {
	private secretKey: string;
	private refreshSecretKey: string;

	constructor() {
		this.secretKey = config.JWT_SECRET || "tu_clave_secreta";
		this.refreshSecretKey =
			config.JWT_REFRESH_SECRET || `${this.secretKey}_refresh`;
	}

	generateAccessToken(payload: UserLogged, expiresIn = config.ACCESS_TOKEN_TTL) {
		return jwt.sign(payload, this.secretKey, { expiresIn });
	}

	generateRefreshToken(
		payload: UserLogged,
		expiresIn = config.REFRESH_TOKEN_TTL,
	) {
		// jwtid makes every refresh token unique even when issued in the same
		// second with the same payload — required for rotation + reuse detection.
		return jwt.sign(payload, this.refreshSecretKey, {
			expiresIn,
			jwtid: crypto.randomUUID(),
		});
	}

	verifyToken(token: string): UserLogged | null {
		try {
			return jwt.verify(token, this.secretKey) as UserLogged;
		} catch (error) {
			return null;
		}
	}

	verifyRefreshToken(token: string): UserLogged | null {
		try {
			return jwt.verify(token, this.refreshSecretKey) as UserLogged;
		} catch (error) {
			return null;
		}
	}

	// Refresh tokens are stored hashed so a DB leak does not expose usable tokens.
	// SHA-256 (not bcrypt) keeps lookups by exact hash cheap and deterministic.
	hashToken(token: string): string {
		return crypto.createHash("sha256").update(token).digest("hex");
	}
}
