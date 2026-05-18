import { useEffect, useState } from "react"
import { getDateRange } from "../services/dateRange"
import { DateRange } from "../../types/dateRange"
import { createLogger } from "../lib/logger"

const logger = createLogger("useDateRange")

export const useDateRange = () => {
  const [dateRange, setDateRange] = useState<DateRange | null>()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    setLoading(true)
    getDateRange()
      .then(setDateRange)
      .catch((err) => {
        logger.error("Error loading date range", { error: err?.message ?? err })
        setError(err.message)
      })
      .finally(() => setLoading(false))
  }, [])

  return { dateRange, loading, error }
}
