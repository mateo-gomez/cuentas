import {
  assertObjectMatch,
  assertRejects,
} from "https://deno.land/std@0.152.0/testing/asserts.ts";
import { CategoryRepository } from "../../../domain/repositories/category.repository.ts";
import { CategoryByIdGetter } from "./categoryByIdGetter.ts";
import { NotFoundError } from "../../errors/notFoundError.ts";

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
