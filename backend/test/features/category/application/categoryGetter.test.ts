import { assertEquals } from "https://deno.land/std@0.152.0/testing/asserts";
import { CategoryRepository } from "../../../../src/features/category/domain/category.repository";
import { CategoryGetter } from "../../../../src/features/category/application/categoryGetter";
import { Category } from "../../../../src/features/category/domain/category.entity";

Deno.test(
  "CategoryGetter - getAll successfully",
  async () => {
    const expected = [{
      _id: "1",
      name: "drink",
      icon: "drink-icon",
      createdAt: new Date(),
      updatedAt: new Date(),
    }, {
      _id: "2",
      name: "food",
      icon: "food-icon",
      createdAt: new Date(),
      updatedAt: new Date(),
    }];

    const repositoryMock: Partial<CategoryRepository> = {
      getAll: () => Promise.resolve(expected),
    };

    const useCase = new CategoryGetter(
      repositoryMock as CategoryRepository,
    );

    const result = await useCase.execute();

    assertEquals(result, expected);
  },
);

Deno.test(
  "CategoryGetter - get empty array",
  async () => {
    const expected: Category[] = [];

    const repositoryMock: Partial<CategoryRepository> = {
      getAll: () => Promise.resolve(expected),
    };

    const useCase = new CategoryGetter(
      repositoryMock as CategoryRepository,
    );

    const result = await useCase.execute();

    assertEquals(result, expected);
  },
);
