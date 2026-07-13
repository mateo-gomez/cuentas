import { CategoryRepository } from "../../../../src/features/category/domain/category.repository";
import { CategoryByIdGetter } from "../../../../src/features/category/application/categoryByIdGetter";
import { NotFoundError } from "../../../../src/application/errors/notFoundError";

describe("CategoryByIdGetter", () => {
	test("get successfully", async () => {
		const repositoryMock: Partial<CategoryRepository> = {
			getByIdForUser: () =>
				Promise.resolve({
					_id: "1",
					userId: "user-1",
					name: "hola",
					icon: "icon",
					createdAt: new Date(),
					updatedAt: new Date(),
				}),
		};
		const useCase = new CategoryByIdGetter(repositoryMock as CategoryRepository);

		const result = await useCase.execute("user-1", "1");

		expect(result).toMatchObject({ _id: "1", name: "hola", icon: "icon" });
	});

	test("throw NotFoundError when id does not exist", async () => {
		const repositoryMock: Partial<CategoryRepository> = {
			getByIdForUser: () => Promise.resolve(null),
		};
		const useCase = new CategoryByIdGetter(repositoryMock as CategoryRepository);

		await expect(useCase.execute("user-1", "notFoundId")).rejects.toThrow(NotFoundError);
	});
});
