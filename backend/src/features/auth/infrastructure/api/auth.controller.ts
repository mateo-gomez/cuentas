import { Request, Response } from "express";
import { HttpResponse } from "../../../../infrastructure/api/httpResponse";
import { AuthSignin } from "../../application/authSignin";
import { AuthSignup } from "../../application/authSignup";
import { AuthRefresh } from "../../application/authRefresh";
import { AuthLogout } from "../../application/authLogout";
import { catchAsync } from "../../../../application/utils/catchAsync";
import { UserDefaultsBootstrapper } from "../../../account/application/userDefaultsBootstrapper";
import { TransactionAccountMigrator } from "../../../transaction/application/useCases/TransactionAccountMigrator";

export class AuthController {
	constructor(
		private readonly authSignin: AuthSignin,
		private readonly authSignup: AuthSignup,
		private readonly authRefresh: AuthRefresh,
		private readonly authLogout: AuthLogout,
		// Per-user defaults bootstrap + one-time legacy backfill (account-management
		// design R3: kept OUT of AuthSignin/AuthSignup to preserve their purity —
		// invoked here, at the controller/orchestration layer. Called from both
		// `signin` and `signup` (signup provisions the brand-new user directly
		// instead of relying on a follow-up signin call).
		private readonly userDefaultsBootstrapper: UserDefaultsBootstrapper,
		private readonly transactionAccountMigrator: TransactionAccountMigrator
	) {}

	// Provisioning failures (defaults seeding / legacy migration) must not fail
	// an otherwise-successful signin/signup — the bootstrap is idempotent and
	// will simply retry on the next login. Errors are swallowed and logged.
	private provisionUserDefaults = async (userId: string): Promise<void> => {
		try {
			const { defaultAccountId } = await this.userDefaultsBootstrapper.ensureFor(userId);
			await this.transactionAccountMigrator.migrateForUser(userId, defaultAccountId);
		} catch (error) {
			console.error(`Failed to provision defaults for user ${userId}:`, error);
		}
	};

	refresh = catchAsync(async (request: Request, response: Response) => {
		const { refreshToken } = request.body;
		const tokens = await this.authRefresh.execute(refreshToken);
		const responseBody = HttpResponse.success(tokens);
		response.status(responseBody.statusCode).json(responseBody);
	});

	logout = catchAsync(async (request: Request, response: Response) => {
		const { refreshToken } = request.body;
		await this.authLogout.execute(refreshToken);
		const responseBody = HttpResponse.success({ success: true });
		response.status(responseBody.statusCode).json(responseBody);
	});

	signin = catchAsync(async (request: Request, response: Response) => {
		const { email, password } = request.body;

		const auth = await this.authSignin.execute(email, password);
		await this.provisionUserDefaults(auth.user._id);
		const responseBody = HttpResponse.success(auth);
		response.status(responseBody.statusCode).json(responseBody);
	});

	signup = catchAsync(async (request: Request, response: Response) => {
		const { email, password, name, surename, lastname } = request.body;

		const newUser = {
			email,
			password,
			name,
			surename,
			lastname,
		};

		await this.authSignup.execute(newUser, password);
		const auth = await this.authSignin.execute(email, password);
		await this.provisionUserDefaults(auth.user._id);
		const responseBody = HttpResponse.success(auth);

		response.status(responseBody.statusCode).json(responseBody);
	});
}
