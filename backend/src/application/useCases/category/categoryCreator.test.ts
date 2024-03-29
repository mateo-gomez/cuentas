import {
  assertObjectMatch,
  assertRejects,
} from "https://deno.land/std@0.152.0/testing/asserts.ts";

import { CategoryRepository } from "../../../domain/repositories/category.repository.ts";
import { CategoryCreator } from "./categoryCreator.ts";
import { DuplicateError } from "../../../infrastructure/api/errors/duplicateError.ts";
import { ApplicationError } from "../../errors/applicationError.ts";

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
