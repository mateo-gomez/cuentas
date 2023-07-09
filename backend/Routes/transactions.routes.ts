import { Router } from "../deps.ts";
import {
  getTransactions,
  saveTransaction,
} from "../Controllers/transaction.controller.ts";

const router = new Router();

router
  .get("/transactions", getTransactions)
  .post("/transactions", saveTransaction);

export default router;
