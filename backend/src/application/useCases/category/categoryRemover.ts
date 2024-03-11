import { CategoryRepository } from "../../../domain/repositories/category.repository.ts";

export class CategoryRemover {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  execute = async (
    id: string,
  ): Promise<void> => {
    const exists = await this.categoryRepository.exists(id);

    if (!exists) {
      throw new Error(`Category ${id} no encontrada`);
    }

    await this.categoryRepository.delete(
      id,
    );
  };
}
