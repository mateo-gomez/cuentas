import { useEffect, useState } from "react"
import { getCategory } from "../services"

export const useCategory = (id: string) => {
  const [category, setCategory] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchCategory = async () => {
      if (!id) return

      setLoading(true)

      try {
        const data = await getCategory(id)

        setCategory(data)
      } catch (error) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchCategory()
  }, [])

  return { category, loading, error }
}
