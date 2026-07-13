import { CategoryRepository } from "../../../../src/features/category/domain/category.repository";
import { CategoryUpdater } from "../../../../src/features/category/application/categoryUpdater";
import { DuplicateError } from "../../../../src/infrastructure/api/errors/duplicateError";
import { ApplicationError } from "../../../../src/application/errors/applicationError";

describe("CategoryUpdater", () => {
	test("update category successfully", async () => {
		const expected = {
			_id: "1",
			userId: "user-1",
			name: "drink",
			icon: "drink-icon",
			createdAt: new Date(),
			updatedAt: new Date(),
		};
		const repositoryMock: Partial<CategoryRepository> = {
			getByIdForUser: () =>
				Promise.resolve({
					_id: "1",
					userId: "user-1",
					name: "food",
					icon: "food-icon",
					createdAt: new Date(),
					updatedAt: new Date(),
				}),
			updateCategory: () => Promise.resolve(expected),
		};
		const useCase = new CategoryUpdater(repositoryMock as CategoryRepository);

		const result = await useCase.execute("user-1", "1", "drink", "drink-icon");

		expect(result).toMatchObject({ _id: "1", name: "drink", icon: "drink-icon" });
	});

	test("throw ApplicationError when name already exists", async () => {
		const repositoryMock: Partial<CategoryRepository> = {
			getByIdForUser: () =>
				Promise.resolve({
					_id: "1",
					userId: "user-1",
					name: "food",
					icon: "food-icon",
					createdAt: new Date(),
					updatedAt: new Date(),
				}),
			updateCategory: () => Promise.reject(new DuplicateError("")),
		};
		const useCase = new CategoryUpdater(repositoryMock as CategoryRepository);

		await expect(useCase.execute("user-1", "1", "drink", "drink-icon")).rejects.toThrow(
			ApplicationError
		);
	});
});
