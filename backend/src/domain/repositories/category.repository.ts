import { Category } from "../entities/category.entity.ts";

export interface CategoryRepository {
  getById: (id: string) => Promise<Category | null>;

  getAll: () => Promise<Category[]>;

  createCategory: (
    name: string,
    icon: string,
  ) => Promise<Category>;

  updateCategory: (
    id: string,
    name: string,
    icon: string,
  ) => Promise<Category>;

  delete: (id: string) => Promise<void>;
}
