import {
  Balance,
  Transaction,
  TransactionAggregate,
  TransactionDTO,
} from "../../types"
import { client } from "../helpers"

interface TransactionResponse {
  transactions: TransactionAggregate[]
  balance: Balance
}

export const getTransactions = async ({
  start,
  end,
}: {
  start: Date
  end: Date
}): Promise<TransactionResponse> => {
  const {
    data: { transactions, balance },
  } = await client.get<{ data: TransactionResponse }>(
    `/transactions/?start=${start.toJSON()}&end=${end.toJSON()}`,
  )

  const data = transactions.map((item) => {
    const transactions = item.transactions.map((transaction) => ({
      ...transaction,
      date: transaction.date,
    }))

    return {
      ...item,
      _id: item._id,
      minDate: new Date(item.minDate),
      maxDate: new Date(item.maxDate),
      transactions,
    }
  })

  return { transactions: data, balance }
}

export const getTransaction = async (
  id: string,
): Promise<Transaction | never> => {
  const { data } = await client.get<{ data: Transaction }>(`transactions/${id}`)

  return { ...data, date: new Date(data.date) }
}

export const createTransaction = async (
  newTransaction: TransactionDTO,
): Promise<void> => {
  client.post("transactions", newTransaction)
}

export const updateTransaction = async (
  transaction: TransactionDTO,
): Promise<void> => {
  client.put(`transactions/${transaction.id}`, transaction)
}
