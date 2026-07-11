import { RefreshToken } from "../../domain/refreshToken.entity";
import { RefreshTokenRepository } from "../../domain/refreshToken.repository";
import { RefreshTokenModel } from "./RefreshToken";

export class MongoRefreshTokenRepository implements RefreshTokenRepository {
	async save(
		userId: string,
		tokenHash: string,
		expiresAt: Date,
	): Promise<RefreshToken> {
		return await RefreshTokenModel.create({ userId, tokenHash, expiresAt });
	}

	async findByHash(tokenHash: string): Promise<RefreshToken | null> {
		return await RefreshTokenModel.findOne({ tokenHash });
	}

	async deleteByHash(tokenHash: string): Promise<void> {
		await RefreshTokenModel.deleteOne({ tokenHash });
	}

	async deleteAllByUser(userId: string): Promise<void> {
		await RefreshTokenModel.deleteMany({ userId });
	}
}
