import { Request, Response } from "express";
import { HttpResponse } from "../../../../infrastructure/api/httpResponse";
import { AuthSignin } from "../../application/authSignin";
import { AuthSignup } from "../../application/authSignup";
import { AuthRefresh } from "../../application/authRefresh";
import { AuthLogout } from "../../application/authLogout";
import { catchAsync } from "../../../../application/utils/catchAsync";

export class AuthController {
	constructor(
		private readonly authSignin: AuthSignin,
		private readonly authSignup: AuthSignup,
		private readonly authRefresh: AuthRefresh,
		private readonly authLogout: AuthLogout
	) {}

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

		try {
			const auth = await this.authSignin.execute(email, password);
			const responseBody = HttpResponse.success(auth);
			response.status(responseBody.statusCode).json(responseBody);
		} catch (error) {
			if (error instanceof Error) {
				const responseBody = HttpResponse.failed(error.message);
				response.status(responseBody.statusCode).json(responseBody);
			}

			throw error;
		}
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
		const responseBody = HttpResponse.success(auth);

		response.status(responseBody.statusCode).json(responseBody);
	});
}
