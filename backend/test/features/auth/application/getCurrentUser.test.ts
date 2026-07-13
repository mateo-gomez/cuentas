import { GetCurrentUser } from "../../../../src/features/auth/application/getCurrentUser";
import { InMemoryAuthRepository } from "../../../InMemoryAuth.repository";
import { NotFoundError } from "../../../../src/application/errors/notFoundError";

describe("GetCurrentUser", () => {
  test("returns the sanitized user without the password field", async () => {
    const repository = new InMemoryAuthRepository();
    const seeded = await repository.seedUser({ name: "Jane" });
    const getCurrentUser = new GetCurrentUser(repository);

    const user = await getCurrentUser.execute(seeded._id);

    expect(user).toMatchObject({ _id: seeded._id, name: "Jane" });
    expect((user as Record<string, unknown>).password).toBeUndefined();
  });

  test("throws NotFoundError when the user does not exist", async () => {
    const repository = new InMemoryAuthRepository();
    const getCurrentUser = new GetCurrentUser(repository);

    await expect(getCurrentUser.execute("missing-id")).rejects.toThrow(NotFoundError);
  });
});
