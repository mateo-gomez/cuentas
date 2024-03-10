import { Router } from "../../../deps.ts";
import {
  getAllTransactions,
  getTransaction,
  saveTransaction,
  updateTransaction,
} from "../Controllers/transaction.controller.ts";

const router = new Router();

router
  .get("/transactions", getAllTransactions)
  .get("/transactions/:id", getTransaction)
  .post("/transactions", saveTransaction)
  .put("/transactions/:id", updateTransaction);

export default router;
