import { useCallback, useEffect, useState } from "react"
import { Account } from "../../types"
import { getAccounts } from "../services"

export const useAccounts = () => {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const load = useCallback(async () => {
    setLoading(true)

    try {
      const data = await getAccounts()
      setAccounts(data)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { accounts, loading, error, refetch: load }
}
