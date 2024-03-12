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

export const getTransactions = async (): Promise<TransactionResponse> => {
  const { transactions, balance } = await client.get<TransactionResponse>(
    "/transactions",
  )

  const data = transactions.map((item) => {
    const transactions = item.transactions.map((transaction) => ({
      ...transaction,
      date: transaction.date,
    }))

    return {
      ...item,
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
  const data = await client.get<Transaction>(`transactions/${id}`)

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
