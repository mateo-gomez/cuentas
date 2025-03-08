import { ForbiddenError } from "../../../application/errors/forbiddenError";
import { AuthService } from "../../../application/services/auth.service";
import { container } from "../../container";
import {
	Middleware,
	NextFunction,
	RequestAuthenticated,
	Response,
} from "./BaseMiddleware";

export class AuthMiddleware implements Middleware {
	constructor(private readonly authService: AuthService) {}

	execute = (req: RequestAuthenticated, _res: Response, next: NextFunction) => {
		const authHeader = req.headers.authorization;

		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			throw new ForbiddenError("Authorization header is required");
		} else {
			const token = authHeader.split(" ")[1];
			const decode = this.authService.verifyToken(token);

			if (!decode) {
				throw new ForbiddenError("Invalid token");
			}

			req.user = decode;

			next();
		}
	};

	static handle = () => {
		return new this(container.authService).execute;
	};
}
