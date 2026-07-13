import { CategoryCreator } from "../../../../src/features/category/application/categoryCreator";
import { CategoryGetter } from "../../../../src/features/category/application/categoryGetter";
import { CategoryRemover } from "../../../../src/features/category/application/categoryRemover";
import { CategoryUpdater } from "../../../../src/features/category/application/categoryUpdater";
import { inMemoryCategoryRepository } from "../../../../src/features/category/infrastructure/database/inMemoryCategory.repository";
import { NotFoundError } from "../../../../src/application/errors/notFoundError";

describe("Category userId scoping", () => {
	test("user B does not see user A's category in their list", async () => {
		const repository = new inMemoryCategoryRepository();
		const creator = new CategoryCreator(repository);
		const getter = new CategoryGetter(repository);

		await creator.execute("user-A", "Groceries", "icon");

		const userBCategories = await getter.execute("user-B");

		expect(userBCategories).toHaveLength(0);
	});

	test("user B cannot update user A's category", async () => {
		const repository = new inMemoryCategoryRepository();
		const creator = new CategoryCreator(repository);
		const updater = new CategoryUpdater(repository);

		const category = await creator.execute("user-A", "Groceries", "icon");

		await expect(
			updater.execute("user-B", category._id, "Hijacked", "icon"),
		).rejects.toThrow(NotFoundError);
	});

	test("user B cannot delete user A's category", async () => {
		const repository = new inMemoryCategoryRepository();
		const creator = new CategoryCreator(repository);
		const remover = new CategoryRemover(repository);

		const category = await creator.execute("user-A", "Groceries", "icon");

		await expect(remover.execute("user-B", category._id)).rejects.toThrow(NotFoundError);
	});
});
