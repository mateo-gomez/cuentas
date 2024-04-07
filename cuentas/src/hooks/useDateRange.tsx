import { useEffect, useState } from "react"
import { getDateRange } from "../services/dateRange"
import { DateRange } from "../../types/dateRange"

export const useDateRange = () => {
  const [dateRange, setDateRange] = useState<DateRange>()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    setLoading(true)
    getDateRange()
      .then(setDateRange)
      .catch((err) => {
        console.log("error loading date range")
        console.error(err)
        setError(err.message)
      })
      .finally(() => setLoading(false))
  }, [])

  return { dateRange, loading, error }
}
