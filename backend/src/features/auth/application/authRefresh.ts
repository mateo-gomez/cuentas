import { ForbiddenError } from "../../../application/errors/forbiddenError";
import { AuthService } from "../../../application/services/auth.service";
import { RefreshTokenRepository } from "../domain/refreshToken.repository";
import { RefreshTokenIssuer, TokenPair } from "./refreshTokenIssuer";

export class AuthRefresh {
	constructor(
		private readonly authService: AuthService,
		private readonly refreshTokenRepository: RefreshTokenRepository,
		private readonly tokenIssuer: RefreshTokenIssuer,
	) {}

	async execute(refreshToken: string): Promise<TokenPair> {
		if (!refreshToken) {
			throw new ForbiddenError("Refresh token is required");
		}

		const payload = this.authService.verifyRefreshToken(refreshToken);

		if (!payload) {
			throw new ForbiddenError("Invalid refresh token");
		}

		const tokenHash = this.authService.hashToken(refreshToken);
		const stored = await this.refreshTokenRepository.findByHash(tokenHash);

		// Reuse detection: a signature-valid token that is no longer in the store
		// was already rotated (or stolen and replayed). Revoke the whole family.
		if (!stored) {
			await this.refreshTokenRepository.deleteAllByUser(payload.id);
			throw new ForbiddenError("Invalid refresh token");
		}

		if (stored.expiresAt.getTime() < Date.now()) {
			await this.refreshTokenRepository.deleteByHash(tokenHash);
			throw new ForbiddenError("Invalid refresh token");
		}

		// Rotate: invalidate the used token before issuing a fresh pair.
		await this.refreshTokenRepository.deleteByHash(tokenHash);

		return await this.tokenIssuer.issue({
			id: payload.id,
			email: payload.email,
		});
	}
}
