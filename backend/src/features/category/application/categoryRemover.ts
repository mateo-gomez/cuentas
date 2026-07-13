import { ApplicationError } from "../../../application/errors/applicationError";
import { NotFoundError } from "../../../application/errors/notFoundError";
import { CategoryRepository } from "../../../features/category/domain/category.repository";
import { DatabaseError } from "../../../infrastructure/api/errors/databaseError";

export class CategoryRemover {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  execute = async (
    userId: string,
    id: string,
  ): Promise<void> => {
    const exists = await this.categoryRepository.existsForUser(userId, id);

    if (!exists) {
      throw new NotFoundError("Categoría no encontrada", id);
    }

    try {
      await this.categoryRepository.delete(
        userId,
        id,
      );
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw new ApplicationError(error.message, error);
      }

      throw new ApplicationError("Error al eliminar categoría", error);
    }
  };
}
