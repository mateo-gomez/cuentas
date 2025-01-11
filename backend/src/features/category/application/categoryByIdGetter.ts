import { Category } from "../domain/category.entity";
import { CategoryRepository } from "../domain/category.repository";
import { NotFoundError } from "../../../application/errors/notFoundError";

export class CategoryByIdGetter {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  execute = async (id: string): Promise<Category> => {
    const category = await this.categoryRepository.getById(id);

    if (!category) {
      throw new NotFoundError("Categoría no encontrada", id);
    }

    return category;
  };
}
