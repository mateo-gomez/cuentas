import { Router } from "express";
import { container } from "../../../../infrastructure/container";
import { BudgetController } from "./budget.controller";

const budgetController = new BudgetController(
  container.budgetGetter,
  container.budgetUpsert,
);

const router = Router();

router
  .get("/", budgetController.getBudget)
  .put("/", budgetController.saveBudget);

export default router;
