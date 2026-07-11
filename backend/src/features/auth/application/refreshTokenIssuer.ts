import jwt from "jsonwebtoken";
import { AuthService } from "../../../application/services/auth.service";
import { RefreshTokenRepository } from "../domain/refreshToken.repository";
import { UserLogged } from "../../../infrastructure/types/UserLogged";

export interface TokenPair {
	token: string;
	refreshToken: string;
}

const REFRESH_FALLBACK_MS = 7 * 24 * 60 * 60 * 1000;

// Generates an access + refresh token pair and persists the refresh token hash.
// Shared by signin and refresh so rotation and issuance stay in one place.
export class RefreshTokenIssuer {
	constructor(
		private readonly authService: AuthService,
		private readonly refreshTokenRepository: RefreshTokenRepository,
	) {}

	async issue(payload: UserLogged): Promise<TokenPair> {
		const token = this.authService.generateAccessToken(payload);
		const refreshToken = this.authService.generateRefreshToken(payload);

		// Persist expiry from the token's own exp claim so DB and JWT never drift.
		const decoded = jwt.decode(refreshToken) as { exp?: number } | null;
		const expiresAt = decoded?.exp
			? new Date(decoded.exp * 1000)
			: new Date(Date.now() + REFRESH_FALLBACK_MS);

		await this.refreshTokenRepository.save(
			payload.id,
			this.authService.hashToken(refreshToken),
			expiresAt,
		);

		return { token, refreshToken };
	}
}
