import { useCallback, useEffect, useState } from "react"
import { BudgetStatus } from "../../types"
import { getBudget } from "../services"
import { createLogger } from "../lib/logger"

const logger = createLogger("useBudget")

export const useBudget = (year: number, month: number) => {
  const [status, setStatus] = useState<BudgetStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const fetch = useCallback(() => {
    setLoading(true)
    getBudget(year, month)
      .then(setStatus)
      .catch((err) => {
        logger.error("Error loading budget", { error: err?.message ?? err })
        setError(err.message)
      })
      .finally(() => setLoading(false))
  }, [year, month])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { status, loading, error, refetch: fetch }
}
