import { CategoryRepository } from "../../../../src/features/category/domain/category.repository";
import { CategoryCreator } from "../../../../src/features/category/application/categoryCreator";
import { DuplicateError } from "../../../../src/infrastructure/api/errors/duplicateError";
import { ApplicationError } from "../../../../src/application/errors/applicationError";

describe("CategoryCreator", () => {
	test("create category successfully", async () => {
		const repositoryMock: Partial<CategoryRepository> = {
			createCategory: () =>
				Promise.resolve({
					_id: "1",
					name: "food",
					icon: "food-icon",
					createdAt: new Date(),
					updatedAt: new Date(),
				}),
		};
		const useCase = new CategoryCreator(repositoryMock as CategoryRepository);

		const result = await useCase.execute("food", "food-icon");

		expect(result).toMatchObject({ _id: "1", name: "food", icon: "food-icon" });
	});

	test("throw ApplicationError when name already exists", async () => {
		const repositoryMock: Partial<CategoryRepository> = {
			createCategory: () =>
				Promise.reject(new DuplicateError("La categoría ya existe")),
		};
		const useCase = new CategoryCreator(repositoryMock as CategoryRepository);

		await expect(useCase.execute("food", "food-icon")).rejects.toThrow(
			ApplicationError
		);
	});
});
