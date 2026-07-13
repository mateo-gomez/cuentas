import { Router } from "express";
import { container } from "../../../../infrastructure/container";
import { AccountController } from "./account.controller";

const accountController = new AccountController(
  container.accountByIdGetter,
  container.accountGetter,
  container.accountCreator,
  container.accountUpdater,
  container.accountRemover,
  container.accountBalanceGetter,
);

const router = Router();

router
  .get("/", accountController.getAccounts)
  .post("/", accountController.saveAccount)
  .get("/:id/balance", accountController.getAccountBalance)
  .get("/:id", accountController.getAccount)
  .put("/:id", accountController.updateAccount)
  .delete("/:id", accountController.deleteAccount);

export default router;
