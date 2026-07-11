import { RefreshToken } from "../../domain/refreshToken.entity";
import { RefreshTokenRepository } from "../../domain/refreshToken.repository";

export class InMemoryRefreshTokenRepository implements RefreshTokenRepository {
	private tokens: RefreshToken[] = [];

	save(userId: string, tokenHash: string, expiresAt: Date): Promise<RefreshToken> {
		const token: RefreshToken = {
			_id: Math.random().toString(36).substring(2, 9),
			userId,
			tokenHash,
			expiresAt,
			createdAt: new Date(),
		};
		this.tokens.push(token);
		return Promise.resolve(token);
	}

	findByHash(tokenHash: string): Promise<RefreshToken | null> {
		return Promise.resolve(
			this.tokens.find((t) => t.tokenHash === tokenHash) ?? null,
		);
	}

	deleteByHash(tokenHash: string): Promise<void> {
		this.tokens = this.tokens.filter((t) => t.tokenHash !== tokenHash);
		return Promise.resolve();
	}

	deleteAllByUser(userId: string): Promise<void> {
		this.tokens = this.tokens.filter((t) => t.userId !== userId);
		return Promise.resolve();
	}

	// Test helper.
	count(): number {
		return this.tokens.length;
	}
}
