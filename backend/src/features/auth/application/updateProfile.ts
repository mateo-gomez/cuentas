import { AuthRepository, ProfileUpdateData } from "../domain/auth.repository";
import { PublicUser } from "../domain/user.entity";
import { NotFoundError } from "../../../application/errors/notFoundError";
import { ValidationError } from "../../../infrastructure/api/errors/validationError";

export class UpdateProfile {
	constructor(private readonly authRepository: AuthRepository) {}

	execute = async (userId: string, data: ProfileUpdateData): Promise<PublicUser> => {
		if (!data.name || !data.name.trim()) {
			throw new ValidationError().addError("name", "El nombre es requerido");
		}

		if (!data.surename || !data.surename.trim()) {
			throw new ValidationError().addError("surename", "El apellido paterno es requerido");
		}

		if (!data.lastname || !data.lastname.trim()) {
			throw new ValidationError().addError("lastname", "El apellido materno es requerido");
		}

		const updated = await this.authRepository.updateProfile(userId, {
			name: data.name,
			surename: data.surename,
			lastname: data.lastname,
		});

		if (!updated) {
			throw new NotFoundError("Usuario no encontrado", userId);
		}

		const { password: _password, ...publicUser } = updated;

		return publicUser;
	};
}
