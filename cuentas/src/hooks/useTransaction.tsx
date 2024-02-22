import { useEffect, useState } from "react"
import { client } from "../helpers/client"
import { Transaction } from "../Pages/Transaction"

const getTransaction = async (id: string): Promise<Transaction | never> => {
  const data = await client.get(`transactions/${id}`)

  return { ...data, date: new Date(data.date) }
}

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
