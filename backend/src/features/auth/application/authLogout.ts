import { AuthService } from "../../../application/services/auth.service";
import { RefreshTokenRepository } from "../domain/refreshToken.repository";

export class AuthLogout {
	constructor(
		private readonly authService: AuthService,
		private readonly refreshTokenRepository: RefreshTokenRepository,
	) {}

	// Revokes the given refresh token. Idempotent: unknown/empty tokens are a no-op
	// so logout never fails the client.
	async execute(refreshToken?: string): Promise<void> {
		if (!refreshToken) {
			return;
		}

		const tokenHash = this.authService.hashToken(refreshToken);
		await this.refreshTokenRepository.deleteByHash(tokenHash);
	}
}
