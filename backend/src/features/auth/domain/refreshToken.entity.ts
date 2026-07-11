export interface RefreshToken {
	_id: string;
	userId: string;
	tokenHash: string;
	expiresAt: Date;
	createdAt: Date;
}
