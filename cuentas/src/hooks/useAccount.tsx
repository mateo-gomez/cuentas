import { useEffect, useState } from "react"
import { getAccount } from "../services"

export const useAccount = (id: string) => {
  const [account, setAccount] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchAccount = async () => {
      if (!id) return

      setLoading(true)

      try {
        const data = await getAccount(id)

        setAccount(data)
      } catch (error) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchAccount()
  }, [id])

  return { account, loading, error }
}
