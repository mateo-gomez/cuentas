import { useEffect, useState } from "react"
import { TransactionAggregate } from "../../types"
import { getTransactions } from "../services"

export const useTransactions = ({ start, end }: { start: Date; end: Date }) => {
  const [transactions, setTransactions] = useState<TransactionAggregate[]>([])
  const [balance, setBalance] = useState({
    balance: 0,
    incomes: 0,
    expenses: 0,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    setLoading(true)
    getTransactions({ start, end })
      .then(({ transactions, balance }) => {
        setTransactions(transactions)
        setBalance(balance)
      })
      .catch((err) => {
        console.log("error loading transaction")
        console.error(err)
        setError(err.message)
      })
      .finally(() => setLoading(false))
  }, [])

  return { transactions, balance, loading, error }
}
