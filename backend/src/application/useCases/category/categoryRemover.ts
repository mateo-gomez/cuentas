import { CategoryRepository } from "../../../domain/repositories/category.repository.ts";

export class CategoryRemover {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  execute = async (
    id: string,
  ): Promise<void> => {
    const categoryRecord = await this.categoryRepository.getById(id);

    if (!categoryRecord) {
      throw new Error(`Category ${id} no encontrada`);
    }

    await this.categoryRepository.delete(
      id,
    );
  };
}
