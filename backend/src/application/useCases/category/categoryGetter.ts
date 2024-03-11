import { Category } from "../../../domain/entities/category.entity.ts";
import { CategoryRepository } from "../../../domain/repositories/category.repository.ts";

export class CategoryGetter {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  execute = async (): Promise<Category[]> => {
    return await this.categoryRepository.getAll();
  };
}
