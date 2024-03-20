import { Category } from "../entities/category.entity.ts";

export interface CategoryRepository {
  exists: (id: string) => Promise<boolean>;

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
  ) => Promise<Category | null>;

  delete: (id: string) => Promise<void>;
}
