import { AuthRepository } from "../domain/auth.repository";
import { PublicUser } from "../domain/user.entity";
import { NotFoundError } from "../../../application/errors/notFoundError";

export class GetCurrentUser {
	constructor(private readonly authRepository: AuthRepository) {}

	execute = async (userId: string): Promise<PublicUser> => {
		const user = await this.authRepository.getById(userId);

		if (!user) {
			throw new NotFoundError("Usuario no encontrado", userId);
		}

		const { password: _password, ...publicUser } = user;

		return publicUser;
	};
}
