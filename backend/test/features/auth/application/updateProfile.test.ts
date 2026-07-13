import { UpdateProfile } from "../../../../src/features/auth/application/updateProfile";
import { InMemoryAuthRepository } from "../../../InMemoryAuth.repository";
import { NotFoundError } from "../../../../src/application/errors/notFoundError";
import { ValidationError } from "../../../../src/infrastructure/api/errors/validationError";

describe("UpdateProfile", () => {
  test("updates name/surename/lastname for the owner", async () => {
    const repository = new InMemoryAuthRepository();
    const seeded = await repository.seedUser({ name: "Jane" });
    const updateProfile = new UpdateProfile(repository);

    const updated = await updateProfile.execute(seeded._id, {
      name: "Janet",
      surename: "M",
      lastname: "Doe",
    });

    expect(updated).toMatchObject({ name: "Janet", surename: "M", lastname: "Doe" });
    expect((updated as Record<string, unknown>).password).toBeUndefined();
  });

  test("ignores an email field present in the payload", async () => {
    const repository = new InMemoryAuthRepository();
    const seeded = await repository.seedUser({ email: "original@example.com" });
    const updateProfile = new UpdateProfile(repository);

    const updated = await updateProfile.execute(seeded._id, {
      name: "Janet",
      surename: "M",
      lastname: "Doe",
      // @ts-expect-error email is intentionally not part of the accepted DTO
      email: "hacked@example.com",
    });

    expect(updated.email).toBe("original@example.com");
  });

  test("throws NotFoundError when the user does not exist", async () => {
    const repository = new InMemoryAuthRepository();
    const updateProfile = new UpdateProfile(repository);

    await expect(
      updateProfile.execute("missing-id", { name: "A", surename: "B", lastname: "C" }),
    ).rejects.toThrow(NotFoundError);
  });

  test("throws ValidationError on empty name", async () => {
    const repository = new InMemoryAuthRepository();
    const seeded = await repository.seedUser();
    const updateProfile = new UpdateProfile(repository);

    await expect(
      updateProfile.execute(seeded._id, { name: "", surename: "M", lastname: "Doe" }),
    ).rejects.toThrow(ValidationError);
  });
});
