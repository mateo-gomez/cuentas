import { model, Schema } from "mongoose";
import { RefreshToken } from "../../domain/refreshToken.entity";

const RefreshTokenSchema = new Schema<RefreshToken>({
	userId: { type: String, required: true, index: true },
	tokenHash: { type: String, required: true, unique: true },
	// Mongo TTL index: documents are auto-removed once expiresAt passes.
	expiresAt: { type: Date, required: true, expires: 0 },
	createdAt: { type: Date, default: Date.now },
});

export const RefreshTokenModel = model<RefreshToken>(
	"RefreshToken",
	RefreshTokenSchema,
);
