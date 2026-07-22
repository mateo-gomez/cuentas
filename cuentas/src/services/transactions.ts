import {
  Balance,
  FrequentCombo,
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

export interface TransferDTO {
  fromAccountId: string
  toAccountId: string
  value: number
  date: Date
  description?: string
}

// Creates an account-to-account transfer (e.g. paying a credit card from a
// bank account). The backend persists it as a linked pair of transactions
// excluded from global income/expense totals.
export const createTransfer = async (transfer: TransferDTO): Promise<void> => {
  await client.post("transactions/transfer", transfer)
}

// Edits an existing transfer by rewriting BOTH linked legs at once, so the two
// sides can never drift apart. Editing a single leg through the normal
// transaction update path is intentionally not allowed for transfers.
export const updateTransfer = async (
  transferId: string,
  transfer: TransferDTO,
): Promise<void> => {
  await client.put(`transactions/transfer/${transferId}`, transfer)
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

// Assigns one category to many transactions at once (bulk categorization from
// the Home multi-selection). `category` is the category id.
export const updateTransactionsCategory = async (
  ids: string[],
  category: string,
): Promise<void> => {
  await client.post("transactions/bulk-category", { ids, category })
}

export const resetAllTransactions = async (): Promise<void> => {
  await client.post("transactions/reset", {})
}

export const importTransactions = async (formData: FormData) => {
  const response = await client.upload("transactions/import", formData)

  return response
}

export const getFrequentCombos = async ({
  accountId,
  limit,
}: {
  accountId?: string
  limit?: number
} = {}): Promise<FrequentCombo[]> => {
  const params = new URLSearchParams()
  if (accountId) params.append("accountId", accountId)
  if (limit) params.append("limit", String(limit))
  const query = params.toString() ? `?${params.toString()}` : ""

  const { data } = await client.get<{ data: FrequentCombo[] }>(
    `/transactions/frequent${query}`,
  )

  return data
}
