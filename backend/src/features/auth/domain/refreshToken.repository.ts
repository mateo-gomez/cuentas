import { RefreshToken } from "./refreshToken.entity";

export interface RefreshTokenRepository {
	save(userId: string, tokenHash: string, expiresAt: Date): Promise<RefreshToken>;
	findByHash(tokenHash: string): Promise<RefreshToken | null>;
	deleteByHash(tokenHash: string): Promise<void>;
	deleteAllByUser(userId: string): Promise<void>;
}
