import { Router } from "express";
import { container } from "../../../../infrastructure/container";
import { AccountController } from "./account.controller";

const accountController = new AccountController(
  container.accountByIdGetter,
  container.accountGetter,
  container.accountCreator,
  container.accountUpdater,
  container.accountRemover,
  container.accountEmptier,
  container.accountBalanceGetter,
  container.accountDefaultGetter,
);

const router = Router();

router
  .get("/", accountController.getAccounts)
  .post("/", accountController.saveAccount)
  // MUST stay before "/:id" — Express matches params greedily, so "default"
  // would otherwise be parsed as an account id.
  .get("/default", accountController.getDefaultAccount)
  .get("/:id/balance", accountController.getAccountBalance)
  .get("/:id", accountController.getAccount)
  .put("/:id", accountController.updateAccount)
  .post("/:id/empty", accountController.emptyAccount)
  .delete("/:id", accountController.deleteAccount);

export default router;
