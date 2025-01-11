import {
  assertObjectMatch,
  assertRejects,
} from "https://deno.land/std@0.152.0/testing/asserts";
import { CategoryRepository } from "../../../../src/features/category/domain/category.repository";
import { CategoryByIdGetter } from "../../../../src/features/category/application/categoryByIdGetter";
import { NotFoundError } from "../../../../src/application/errors/notFoundError";

Deno.test(
  "CategoryByIdGetter - get successfully",
  async () => {
    const repositoryMock: Partial<CategoryRepository> = {
      getById: () =>
        Promise.resolve({
          _id: "1",
          name: "hola",
          icon: "icon",
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
    };

    const useCase = new CategoryByIdGetter(
      repositoryMock as CategoryRepository,
    );

    const expected = {
      _id: "1",
      name: "hola",
      icon: "icon",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await useCase.execute("1");

    assertObjectMatch(result, expected);
  },
);

Deno.test("CategoryByIdGetter - throw NotFoundError when id does not exist", () => {
  const repositoryMock: Partial<CategoryRepository> = {
    getById: () => Promise.resolve(null),
  };

  const useCase = new CategoryByIdGetter(
    repositoryMock as CategoryRepository,
  );

  const resultPromise = useCase.execute("notFoundId");

  assertRejects(
    () => resultPromise,
    NotFoundError,
    "Categoría no encontrada",
  );
});
