import { AuthService } from "../../../../src/application/services/auth.service";
import { AuthRefresh } from "../../../../src/features/auth/application/authRefresh";
import { AuthLogout } from "../../../../src/features/auth/application/authLogout";
import { RefreshTokenIssuer } from "../../../../src/features/auth/application/refreshTokenIssuer";
import { InMemoryRefreshTokenRepository } from "../../../../src/features/auth/infrastructure/database/inMemoryRefreshToken.repository";

const PAYLOAD = { id: "user-1", email: "user@test.com" };

describe("Refresh token flow", () => {
	let authService: AuthService;
	let repo: InMemoryRefreshTokenRepository;
	let issuer: RefreshTokenIssuer;
	let authRefresh: AuthRefresh;
	let authLogout: AuthLogout;

	beforeEach(() => {
		authService = new AuthService();
		repo = new InMemoryRefreshTokenRepository();
		issuer = new RefreshTokenIssuer(authService, repo);
		authRefresh = new AuthRefresh(authService, repo, issuer);
		authLogout = new AuthLogout(authService, repo);
	});

	describe("AuthRefresh", () => {
		test("rotates: returns a new pair and keeps exactly one stored token", async () => {
			const { refreshToken } = await issuer.issue(PAYLOAD);
			expect(repo.count()).toBe(1);

			const rotated = await authRefresh.execute(refreshToken);

			expect(rotated.token).toBeTruthy();
			expect(rotated.refreshToken).toBeTruthy();
			expect(rotated.refreshToken).not.toBe(refreshToken);
			// Old hash replaced by the new one, not accumulated.
			expect(repo.count()).toBe(1);
		});

		test("new access token carries the same user identity", async () => {
			const { refreshToken } = await issuer.issue(PAYLOAD);

			const rotated = await authRefresh.execute(refreshToken);
			const decoded = authService.verifyToken(rotated.token);

			expect(decoded?.id).toBe(PAYLOAD.id);
			expect(decoded?.email).toBe(PAYLOAD.email);
		});

		test("reusing a rotated token revokes the whole family", async () => {
			const { refreshToken: original } = await issuer.issue(PAYLOAD);

			// Legit rotation consumes `original`.
			await authRefresh.execute(original);

			// Replaying the consumed token is treated as theft: nuke every token.
			await expect(authRefresh.execute(original)).rejects.toThrow(
				"Invalid refresh token",
			);
			expect(repo.count()).toBe(0);
		});

		test("rejects an expired stored token and removes it", async () => {
			const { refreshToken } = await issuer.issue(PAYLOAD);
			const stored = await repo.findByHash(authService.hashToken(refreshToken));
			stored!.expiresAt = new Date(Date.now() - 1000);

			await expect(authRefresh.execute(refreshToken)).rejects.toThrow(
				"Invalid refresh token",
			);
			expect(repo.count()).toBe(0);
		});

		test("rejects a token with an invalid signature", async () => {
			await expect(authRefresh.execute("not-a-real-token")).rejects.toThrow(
				"Invalid refresh token",
			);
		});

		test("rejects an empty token", async () => {
			await expect(authRefresh.execute("")).rejects.toThrow(
				"Refresh token is required",
			);
		});
	});

	describe("AuthLogout", () => {
		test("revokes the given token so it can no longer refresh", async () => {
			const { refreshToken } = await issuer.issue(PAYLOAD);
			expect(repo.count()).toBe(1);

			await authLogout.execute(refreshToken);
			expect(repo.count()).toBe(0);

			await expect(authRefresh.execute(refreshToken)).rejects.toThrow(
				"Invalid refresh token",
			);
		});

		test("is a no-op when no token is provided", async () => {
			await issuer.issue(PAYLOAD);

			await expect(authLogout.execute()).resolves.toBeUndefined();
			expect(repo.count()).toBe(1);
		});
	});
});
