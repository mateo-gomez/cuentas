import { type Response } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import transactionsData from "../database/cuentas.js";

export const getTransactions = ({ response }: { response: Response }) => {
  response.body = transactionsData;
};
