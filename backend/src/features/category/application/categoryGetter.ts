import { Category } from "../domain/category.entity";
import { CategoryRepository } from "../domain/category.repository";

export class CategoryGetter {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  execute = async (): Promise<Category[]> => {
    return await this.categoryRepository.getAll();
  };
}
