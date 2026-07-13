import { CategoryRepository } from "../../../../src/features/category/domain/category.repository";
import { CategoryGetter } from "../../../../src/features/category/application/categoryGetter";
import { Category } from "../../../../src/features/category/domain/category.entity";

describe("CategoryGetter", () => {
	test("getAll successfully", async () => {
		const expected: Category[] = [
			{
				_id: "1",
				userId: "user-1",
				name: "drink",
				icon: "drink-icon",
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			{
				_id: "2",
				userId: "user-1",
				name: "food",
				icon: "food-icon",
				createdAt: new Date(),
				updatedAt: new Date(),
			},
		];
		const repositoryMock: Partial<CategoryRepository> = {
			getAllForUser: () => Promise.resolve(expected),
		};
		const useCase = new CategoryGetter(repositoryMock as CategoryRepository);

		const result = await useCase.execute("user-1");

		expect(result).toBe(expected);
	});

	test("get empty array", async () => {
		const repositoryMock: Partial<CategoryRepository> = {
			getAllForUser: () => Promise.resolve([]),
		};
		const useCase = new CategoryGetter(repositoryMock as CategoryRepository);

		const result = await useCase.execute("user-1");

		expect(result).toEqual([]);
	});
});
