import { useCallback, useEffect, useState } from "react"
import { TransactionAggregate } from "../../types"
import { deleteTransactions, getTransactions } from "../services"
import { createLogger } from "../lib/logger"

const logger = createLogger("useTransactions")

export const useTransactions = ({
  start,
  end,
  accountId,
}: {
  start: Date
  end: Date
  accountId?: string
}) => {
  const [transactions, setTransactions] = useState<TransactionAggregate[]>([])
  const [balance, setBalance] = useState({
    balance: 0,
    incomes: 0,
    expenses: 0,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const load = useCallback(() => {
    setLoading(true)
    return getTransactions({ start, end, accountId })
      .then(({ transactions, balance }) => {
        setTransactions(transactions)
        setBalance(balance)
      })
      .catch((err) => {
        logger.error("Error loading transactions", { error: err?.message ?? err })
        setError(err.message)
      })
      .finally(() => setLoading(false))
  }, [start, end, accountId])

  useEffect(() => {
    load()
  }, [load])

  const removeTransactions = useCallback(
    async (ids: string[]) => {
      await deleteTransactions(ids)
      await load()
    },
    [load],
  )

  return { transactions, balance, loading, error, refetch: load, removeTransactions }
}
