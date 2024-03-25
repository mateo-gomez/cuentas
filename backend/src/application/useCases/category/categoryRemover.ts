import { CategoryRepository } from "../../../domain/repositories/category.repository.ts";
import { DatabaseError } from "../../../infrastructure/api/errors/databaseError.ts";
import { ApplicationError } from "../../errors/applicationError.ts";
import { NotFoundError } from "../../errors/notFoundError.ts";

export class CategoryRemover {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  execute = async (
    id: string,
  ): Promise<void> => {
    const exists = await this.categoryRepository.exists(id);

    if (!exists) {
      throw new NotFoundError("Categoría no encontrada", id);
    }

    try {
      await this.categoryRepository.delete(
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
