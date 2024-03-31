import { Category } from "../../domain/category.entity.ts";
import { CategoryRepository } from "../../domain/category.repository.ts";

export class inMemoryCategoryRepository implements CategoryRepository {
  private collection: Category[] = [];

  exists = (id: string): Promise<boolean> => {
    const exists =
      this.collection.findIndex((category) => category._id === id) >= 0;

    return Promise.resolve(exists !== null);
  };

  getById = (id: string): Promise<Category | null> => {
    const category = this.collection.find((category) => category._id === id);

    return Promise.resolve(category || null);
  };

  getAll = (): Promise<Category[]> => {
    return Promise.resolve(this.collection);
  };

  createCategory = (
    name: string,
    icon: string,
  ): Promise<Category> => {
    const category: Category = {
      _id: crypto.randomUUID(),
      name,
      icon,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.collection.push(category);

    return Promise.resolve(category);
  };

  updateCategory = async (
    id: string,
    name: string,
    icon: string,
  ): Promise<Category | null> => {
    const category = await Promise.resolve(
      this.collection.find((category) => category._id === id),
    );

    if (!category) {
      return null;
    }

    category.name = name;
    category.icon = icon;
    category.updatedAt = new Date();

    return category;
  };

  delete = async (id: string): Promise<void> => {
    await Promise.resolve(
      this.collection.filter((category) => category._id !== id),
    );
  };
}
