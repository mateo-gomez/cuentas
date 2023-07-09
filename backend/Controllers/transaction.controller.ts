import Transaction from "../models/Transaction.ts";

import { Status } from "../deps.ts";
import type { RouterContext } from "../deps.ts";

export const getTransactions = async ({ response }: RouterContext<string>) => {
  response.body = await Transaction.find().populate("category", [
    "_id",
    "name",
    "icon",
  ])
    .sort({
      date: "desc",
    });
};

export const saveTransaction = async (
  { response, request }: RouterContext<string>,
) => {
  const body = await request.body({ type: "json" }).value;
  const transaction = await Transaction.create(body);

  response.status = Status.Created;
  response.body = transaction;
};
