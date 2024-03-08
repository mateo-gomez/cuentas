import { useEffect, useState } from "react"
import { Transaction } from "../../types"
import { getTransaction } from "../services"

export const useTransaction = (id: string) => {
  const [transaction, setTransaction] = useState<Transaction | null>()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (id) {
      setLoading(true)
      getTransaction(id)
        .then(setTransaction)
        .catch((err) => {
          console.log("error loading transaction")
          console.error(err)
        })
        .finally(() => setLoading(false))
    }
  }, [])

  return { transaction, loading }
}
