import { Category } from "../../domain/category.entity";
import { CategoryRepository } from "../../domain/category.repository";

export class inMemoryCategoryRepository implements CategoryRepository {
  private collection: Category[] = [];

  existsForUser = (userId: string, id: string): Promise<boolean> => {
    const exists = this.collection.some(
      (category) => category._id === id && category.userId === userId,
    );

    return Promise.resolve(exists);
  };

  getByIdForUser = (userId: string, id: string): Promise<Category | null> => {
    const category = this.collection.find(
      (category) => category._id === id && category.userId === userId,
    );

    return Promise.resolve(category || null);
  };

  getByNameForUser = (userId: string, name: string): Promise<Category | null> => {
    const category = this.collection.find(
      (category) => category.name === name && category.userId === userId,
    );

    return Promise.resolve(category || null);
  };

  getAllForUser = (userId: string): Promise<Category[]> => {
    return Promise.resolve(
      this.collection.filter((category) => category.userId === userId),
    );
  };

  createCategory = (
    userId: string,
    name: string,
    icon: string,
  ): Promise<Category> => {
    const category: Category = {
      _id: crypto.randomUUID(),
      userId,
      name,
      icon,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.collection.push(category);

    return Promise.resolve(category);
  };

  updateCategory = async (
    userId: string,
    id: string,
    name: string,
    icon: string,
  ): Promise<Category | null> => {
    const category = await Promise.resolve(
      this.collection.find(
        (category) => category._id === id && category.userId === userId,
      ),
    );

    if (!category) {
      return null;
    }

    category.name = name;
    category.icon = icon;
    category.updatedAt = new Date();

    return category;
  };

  delete = async (userId: string, id: string): Promise<void> => {
    this.collection = await Promise.resolve(
      this.collection.filter(
        (category) => !(category._id === id && category.userId === userId),
      ),
    );
  };

  hasOwnerlessCategories = (): Promise<boolean> => {
    return Promise.resolve(this.collection.some((category) => !category.userId));
  };

  migrateOwnerlessCategories = (userId: string): Promise<number> => {
    let migrated = 0;

    this.collection = this.collection.map((category) => {
      if (!category.userId) {
        migrated += 1;
        return { ...category, userId };
      }

      return category;
    });

    return Promise.resolve(migrated);
  };
}
