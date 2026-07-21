import { useCallback, useEffect, useState } from "react"
import { CategoryReport } from "../../types"
import { getCategoryReport, ReportSide } from "../services"
import { createLogger } from "../lib/logger"

const logger = createLogger("useCategoryReport")

export const useCategoryReport = ({
  start,
  end,
  accountId,
  type = "expense",
}: {
  start: Date
  end: Date
  accountId?: string
  type?: ReportSide
}) => {
  const [report, setReport] = useState<CategoryReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const fetch = useCallback(() => {
    setLoading(true)
    setError("")
    getCategoryReport({ start, end, accountId, type })
      .then(setReport)
      .catch((err) => {
        logger.error("Error loading category report", {
          error: err?.message ?? err,
        })
        setError(err?.message ?? "Error")
      })
      .finally(() => setLoading(false))
  }, [start, end, accountId, type])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { report, loading, error, refetch: fetch }
}
