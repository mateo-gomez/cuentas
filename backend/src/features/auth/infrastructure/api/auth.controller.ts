import { Request, Response } from "express";
import { HttpResponse } from "../../../../infrastructure/api/httpResponse";
import { AuthSignin } from "../../application/authSignin";
import { AuthSignup } from "../../application/authSignup";

export class AuthController {
	constructor(
		private readonly authSignin: AuthSignin,
		private readonly authSignup: AuthSignup
	) {}

	signin = async (request: Request, response: Response) => {
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
	};

	signup = async (request: Request, response: Response) => {
		const { email, password, name, surename, lastname } = request.body;

		const newUser = {
			email,
			password,
			name,
			surename,
			lastname,
		};

		try {
			await this.authSignup.execute(newUser, password);
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
	};
}
