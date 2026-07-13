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
  accountId,
}: {
  start: Date
  end: Date
  accountId?: string
}): Promise<TransactionResponse> => {
  const accountQuery = accountId ? `&accountId=${accountId}` : ""

  const {
    data: { transactions, balance },
  } = await client.get<{ data: TransactionResponse }>(
    `/transactions/?start=${start.toJSON()}&end=${end.toJSON()}${accountQuery}`,
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
  await client.post("transactions", newTransaction)
}

export const updateTransaction = async (
  transaction: TransactionDTO,
): Promise<void> => {
  await client.put(`transactions/${transaction.id}`, transaction)
}

export const deleteTransaction = async (id: string): Promise<void> => {
  await client.delete(`transactions/${id}`)
}

export const deleteTransactions = async (ids: string[]): Promise<void> => {
  await client.post("transactions/bulk-delete", { ids })
}

export const importTransactions = async (formData: FormData) => {
  const response = await client.upload("transactions/import", formData)

  return response
}
