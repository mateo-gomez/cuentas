import { useEffect, useState } from "react"
import { Transaction } from "../../types"
import { getTransaction } from "../services"
import { createLogger } from "../lib/logger"

const logger = createLogger("useTransaction")

export const useTransaction = (id: string) => {
  const [transaction, setTransaction] = useState<Transaction | null>()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (id) {
      setLoading(true)
      getTransaction(id)
        .then(setTransaction)
        .catch((err) => {
          logger.error("Error loading transaction", {
            id,
            error: err?.message ?? err,
          })
        })
        .finally(() => setLoading(false))
    }
  }, [])

  return { transaction, loading }
}
