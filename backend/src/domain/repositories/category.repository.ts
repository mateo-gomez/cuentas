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
    categoryData: Omit<Category, "_id" | "updatedAt" | "createdAt">,
  ) => Promise<Category>;
}
