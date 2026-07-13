import bcrypt from "bcrypt";
import { AuthRepository } from "../domain/auth.repository";
import { NotFoundError } from "../../../application/errors/notFoundError";
import { ValidationError } from "../../../infrastructure/api/errors/validationError";

// Locked decision: new password minimum length is 8 characters.
const MIN_PASSWORD_LENGTH = 8;

export class ChangePassword {
	constructor(private readonly authRepository: AuthRepository) {}

	execute = async (
		userId: string,
		currentPassword: string,
		newPassword: string,
	): Promise<{ success: true }> => {
		const user = await this.authRepository.getById(userId);

		if (!user) {
			throw new NotFoundError("Usuario no encontrado", userId);
		}

		const matches = await bcrypt.compare(currentPassword, user.password);

		if (!matches) {
			throw new ValidationError().addError(
				"currentPassword",
				"La contraseña actual es incorrecta",
			);
		}

		if (!newPassword || newPassword.length < MIN_PASSWORD_LENGTH) {
			throw new ValidationError().addError(
				"newPassword",
				`La nueva contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`,
			);
		}

		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(newPassword, salt);

		await this.authRepository.updatePassword(userId, hashedPassword);

		return { success: true };
	};
}
