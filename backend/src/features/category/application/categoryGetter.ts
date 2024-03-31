import { Category } from "../domain/category.entity.ts";
import { CategoryRepository } from "../domain/category.repository.ts";

export class CategoryGetter {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  execute = async (): Promise<Category[]> => {
    return await this.categoryRepository.getAll();
  };
}
