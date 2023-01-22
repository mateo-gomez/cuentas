import { Router } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import { getTransactions } from "../Controllers/transaction.controller.ts";

const router = new Router();

router.get("/", getTransactions);

export default router;
