import { useEffect, useState } from "react"
import { FrequentCombo } from "../../types"
import { getFrequentCombos } from "../services"
import { createLogger } from "../lib/logger"

const logger = createLogger("useSuggestions")

// Fetches the current user's most frequent (description, category, type)
// combos scoped to the active account, powering Home's suggestion chips.
export const useSuggestions = (accountId?: string) => {
  const [suggestions, setSuggestions] = useState<FrequentCombo[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)

      try {
        const data = await getFrequentCombos({ accountId })
        if (!cancelled) setSuggestions(data)
      } catch (error) {
        logger.error("Error loading suggestions", { error })
        if (!cancelled) setSuggestions([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [accountId])

  return { suggestions, loading }
}
