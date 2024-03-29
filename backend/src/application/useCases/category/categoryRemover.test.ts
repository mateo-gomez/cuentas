import {
  assertSpyCall,
  assertSpyCalls,
  returnsNext,
  spy,
  stub,
} from "https://deno.land/std@0.221.0/testing/mock.ts";
import {
  assertRejects,
} from "https://deno.land/std@0.152.0/testing/asserts.ts";
import { CategoryRepository } from "../../../domain/repositories/category.repository.ts";
import { CategoryRemover } from "./categoryRemover.ts";
import { NotFoundError } from "../../errors/notFoundError.ts";

const repositoryMock: Partial<CategoryRepository> = {
  delete: () => Promise.resolve(),
  exists: () => Promise.resolve(true),
};
const existsStub = stub(repositoryMock, "exists", returnsNext([true, false]));
const deleteSpy = spy(repositoryMock, "delete");

Deno.test(
  "CategoryRemover - remove successfully",
  async () => {
    const useCase = new CategoryRemover(
      repositoryMock as CategoryRepository,
    );

    const categoryId = "1";

    await useCase.execute(categoryId);

    assertSpyCalls(existsStub, 1);
    assertSpyCall(existsStub, 0, {
      args: [categoryId],
      returned: true,
    });

    assertSpyCalls(deleteSpy, 1);
    assertSpyCall(deleteSpy, 0, {
      args: [categoryId],
    });
  },
);

Deno.test("CategoryRemover - throw NotFoundError when id does not exist", () => {
  const useCase = new CategoryRemover(
    repositoryMock as CategoryRepository,
  );

  const categoryId = "1";

  assertRejects(
    () => useCase.execute(categoryId),
    NotFoundError,
    "Categoría no encontrada",
  );

  assertSpyCalls(existsStub, 2);
  assertSpyCall(existsStub, 1, {
    args: [categoryId],
    returned: false,
  });

  assertSpyCalls(deleteSpy, 1);
});
