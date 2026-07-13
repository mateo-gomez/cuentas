import { Category } from "../../domain/category.entity";
import { DatabaseError } from "../../../../infrastructure/api/errors/databaseError";
import { CategoryRepository } from "../../domain/category.repository";
import CategoryModel from "./Category";
import { DuplicateError } from "../../../../infrastructure/api/errors/duplicateError";

export class MongoCategoryRepository implements CategoryRepository {
	existsForUser = async (userId: string, id: string): Promise<boolean> => {
		const exists = await CategoryModel.exists({ _id: id, userId });

		return exists !== null;
	};

	getByIdForUser = async (userId: string, id: string): Promise<Category | null> => {
		const doc = await CategoryModel.findOne({ _id: id, userId }).lean();
		return doc as unknown as Category | null;
	};

	getByNameForUser = async (userId: string, name: string): Promise<Category | null> => {
		const doc = await CategoryModel.findOne({ userId, name }).lean();
		return doc as unknown as Category | null;
	};

	getAllForUser = async (userId: string): Promise<Category[]> => {
		const docs = await CategoryModel.find({ userId }).lean();
		return docs as unknown as Category[];
	};

	createCategory = async (userId: string, name: string, icon: string): Promise<Category> => {
		try {
			const doc = await CategoryModel.create({ userId, name, icon });
			return doc as unknown as Category;
		} catch (error) {
			const e = error as { name?: string; code?: number } & Error;
			if (e.name === "MongoServerError" && e.code === 11000) {
				throw new DuplicateError(
					`La categoría "${name}" already exists.`,
					e
				);
			}

			throw new DatabaseError("Error creando categoría", e);
		}
	};

	updateCategory = async (
		userId: string,
		id: string,
		name: string,
		icon: string
	): Promise<Category | null> => {
		try {
			const category = await CategoryModel.findOneAndUpdate(
				{ _id: id, userId },
				{ name, icon },
				{
					returnDocument: "after",
					lean: true,
				}
			);

			return category as unknown as Category | null;
		} catch (error) {
			const e = error as { name?: string; code?: number } & Error;
			if (e.name === "MongoServerError" && e.code === 11000) {
				throw new DuplicateError(
					`La categoría "${name}" already exists.`,
					e
				);
			}

			throw new DatabaseError("Error al guardar categoría", e);
		}
	};

	delete = async (userId: string, id: string): Promise<void> => {
		const { deletedCount } = await CategoryModel.deleteOne({ _id: id, userId });

		if (deletedCount === 0) {
			throw new DatabaseError(`Category ${id} not deleted`);
		}
	};

	hasOwnerlessCategories = async (): Promise<boolean> => {
		const exists = await CategoryModel.exists({ userId: { $exists: false } });

		return exists !== null;
	};

	migrateOwnerlessCategories = async (userId: string): Promise<number> => {
		const { modifiedCount } = await CategoryModel.updateMany(
			{ userId: { $exists: false } },
			{ $set: { userId } },
		);

		return modifiedCount;
	};
}
