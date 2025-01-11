import {
  assertObjectMatch,
  assertRejects,
} from "https://deno.land/std@0.152.0/testing/asserts";

import { CategoryRepository } from "../../../../src/features/category/domain/category.repository";
import { CategoryCreator } from "../../../../src/features/category/application/categoryCreator";
import { DuplicateError } from "../../../../src/infrastructure/api/errors/duplicateError";
import { ApplicationError } from "../../../../src/application/errors/applicationError";

Deno.test(
  "CategoryCreator - create category successfully",
  async () => {
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

    const useCase = new CategoryCreator(
      repositoryMock as CategoryRepository,
    );

    const expected = {
      _id: "1",
      name: "food",
      icon: "food-icon",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await useCase.execute("food", "food-icon");

    assertObjectMatch(result, expected);
  },
);

Deno.test("CategoryCreator - throw DuplicateError when name already exists", () => {
  const repositoryMock: Partial<CategoryRepository> = {
    createCategory: () =>
      Promise.reject(new DuplicateError("La categoría ya existe")),
  };

  const useCase = new CategoryCreator(
    repositoryMock as CategoryRepository,
  );

  const resultPromise = useCase.execute("food", "food-icon");

  assertRejects(
    () => resultPromise,
    ApplicationError,
    `La categoría "food" ya existe`,
  );
});
