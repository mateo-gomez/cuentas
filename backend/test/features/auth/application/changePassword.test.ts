import bcrypt from "bcrypt";
import { ChangePassword } from "../../../../src/features/auth/application/changePassword";
import { InMemoryAuthRepository } from "../../../InMemoryAuth.repository";
import { NotFoundError } from "../../../../src/application/errors/notFoundError";
import { ValidationError } from "../../../../src/infrastructure/api/errors/validationError";

describe("ChangePassword", () => {
  test("re-hashes and stores the new password on happy path", async () => {
    const repository = new InMemoryAuthRepository();
    const seeded = await repository.seedUser({ plainPassword: "oldPassword1" });
    const changePassword = new ChangePassword(repository);

    await changePassword.execute(seeded._id, "oldPassword1", "newPassword1");

    const updated = await repository.getById(seeded._id);
    expect(updated!.password).not.toBe(seeded.password);
    await expect(bcrypt.compare("newPassword1", updated!.password)).resolves.toBe(true);
  });

  test("rejects an incorrect current password", async () => {
    const repository = new InMemoryAuthRepository();
    const seeded = await repository.seedUser({ plainPassword: "oldPassword1" });
    const changePassword = new ChangePassword(repository);

    await expect(
      changePassword.execute(seeded._id, "wrongPassword", "newPassword1"),
    ).rejects.toThrow(ValidationError);

    const untouched = await repository.getById(seeded._id);
    expect(untouched!.password).toBe(seeded.password);
  });

  test("throws NotFoundError when the user does not exist", async () => {
    const repository = new InMemoryAuthRepository();
    const changePassword = new ChangePassword(repository);

    await expect(
      changePassword.execute("missing-id", "oldPassword1", "newPassword1"),
    ).rejects.toThrow(NotFoundError);
  });

  test("rejects a new password shorter than 8 characters", async () => {
    const repository = new InMemoryAuthRepository();
    const seeded = await repository.seedUser({ plainPassword: "oldPassword1" });
    const changePassword = new ChangePassword(repository);

    await expect(
      changePassword.execute(seeded._id, "oldPassword1", "short1"),
    ).rejects.toThrow(ValidationError);

    const untouched = await repository.getById(seeded._id);
    expect(untouched!.password).toBe(seeded.password);
  });
});
