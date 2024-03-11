import { Category } from "../entities/category.entity.ts";

export interface CategoryRepository {
  getById: (id: string) => Promise<Category | null>;
}
