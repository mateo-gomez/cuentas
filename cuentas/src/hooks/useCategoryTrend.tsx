import { useCallback, useEffect, useState } from "react"
import { CategoryTrend } from "../../types"
import { getCategoryTrend, ReportSide } from "../services"
import { createLogger } from "../lib/logger"

const logger = createLogger("useCategoryTrend")

export const useCategoryTrend = ({
  year,
  month,
  accountId,
  type = "expense",
}: {
  year: number
  month: number
  accountId?: string
  type?: ReportSide
}) => {
  const [trend, setTrend] = useState<CategoryTrend | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const fetch = useCallback(() => {
    setLoading(true)
    setError("")
    getCategoryTrend({ year, month, accountId, type })
      .then(setTrend)
      .catch((err) => {
        logger.error("Error loading category trend", {
          error: err?.message ?? err,
        })
        setError(err?.message ?? "Error")
      })
      .finally(() => setLoading(false))
  }, [year, month, accountId, type])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { trend, loading, error, refetch: fetch }
}
