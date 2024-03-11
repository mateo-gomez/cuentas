import { Category } from "../../../domain/entities/category.entity.ts";
import { CategoryRepository } from "../../../domain/repositories/category.repository.ts";
import { isIdValid } from "../../utils/isIdValid.ts";

export class CategoryByIdGetter {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  execute = async (id: string): Promise<Category> => {
    if (!isIdValid(id)) {
      throw new Error(`El id ${id} es inválido.`);
    }

    const category = await this.categoryRepository.getById(id);

    if (!category) {
      throw new Error(`Category ${id} not found`);
    }

    return category;
  };
}
