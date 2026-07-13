import { Category } from "./category.entity";

export interface CategoryRepository {
  existsForUser: (userId: string, id: string) => Promise<boolean>;

  getByIdForUser: (userId: string, id: string) => Promise<Category | null>;

  getByNameForUser: (userId: string, name: string) => Promise<Category | null>;

  getAllForUser: (userId: string) => Promise<Category[]>;

  createCategory: (
    userId: string,
    name: string,
    icon: string,
  ) => Promise<Category>;

  updateCategory: (
    userId: string,
    id: string,
    name: string,
    icon: string,
  ) => Promise<Category | null>;

  delete: (userId: string, id: string) => Promise<void>;

  /** True if any category document has no owner (pre-migration legacy data). */
  hasOwnerlessCategories: () => Promise<boolean>;

  /** One-time backfill: assigns `userId` to every ownerless category. Never deletes (Transaction refs by id). */
  migrateOwnerlessCategories: (userId: string) => Promise<number>;
}
