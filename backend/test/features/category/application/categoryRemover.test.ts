import { CategoryRepository } from "../../../../src/features/category/domain/category.repository";
import { CategoryRemover } from "../../../../src/features/category/application/categoryRemover";
import { NotFoundError } from "../../../../src/application/errors/notFoundError";

describe("CategoryRemover", () => {
	test("remove successfully", async () => {
		const existsMock = jest.fn().mockResolvedValue(true);
		const deleteMock = jest.fn().mockResolvedValue(undefined);
		const repositoryMock = {
			exists: existsMock,
			delete: deleteMock,
		} as unknown as CategoryRepository;
		const useCase = new CategoryRemover(repositoryMock);

		await useCase.execute("1");

		expect(existsMock).toHaveBeenCalledWith("1");
		expect(deleteMock).toHaveBeenCalledWith("1");
	});

	test("throw NotFoundError when id does not exist", async () => {
		const existsMock = jest.fn().mockResolvedValue(false);
		const deleteMock = jest.fn();
		const repositoryMock = {
			exists: existsMock,
			delete: deleteMock,
		} as unknown as CategoryRepository;
		const useCase = new CategoryRemover(repositoryMock);

		await expect(useCase.execute("1")).rejects.toThrow(NotFoundError);
		expect(deleteMock).not.toHaveBeenCalled();
	});
});
