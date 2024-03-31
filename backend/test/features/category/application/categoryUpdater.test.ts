import {
  assertObjectMatch,
  assertRejects,
} from "https://deno.land/std@0.152.0/testing/asserts.ts";

import { CategoryRepository } from "../../../../src/features/category/domain/category.repository.ts";
import { CategoryUpdater } from "../../../../src/features/category/application/categoryUpdater.ts";
import { DuplicateError } from "../../../../src/infrastructure/api/errors/duplicateError.ts";
import { ApplicationError } from "../../../../src/application/errors/applicationError.ts";

Deno.test(
  "CategoryUpdater - update category successfully",
  async () => {
    const expected = {
      _id: "1",
      name: "drink",
      icon: "drink-icon",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const repositoryMock: Partial<CategoryRepository> = {
      getById: () =>
        Promise.resolve({
          _id: "1",
          name: "food",
          icon: "food-icon",
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      updateCategory: () => Promise.resolve(expected),
    };

    const useCase = new CategoryUpdater(
      repositoryMock as CategoryRepository,
    );

    const result = await useCase.execute("1", "drink", "drink-icon");

    assertObjectMatch(result, expected);
  },
);

Deno.test("CategoryUpdater - throw DuplicateError when name already exists", () => {
  const repositoryMock: Partial<CategoryRepository> = {
    getById: () =>
      Promise.resolve({
        _id: "1",
        name: "food",
        icon: "food-icon",
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    updateCategory: () => Promise.reject(new DuplicateError("")),
  };

  const useCase = new CategoryUpdater(
    repositoryMock as CategoryRepository,
  );

  const resultPromise = useCase.execute("1", "drink", "drink-icon");

  assertRejects(
    () => resultPromise,
    ApplicationError,
    `La categoría "drink" ya existe`,
  );
});
