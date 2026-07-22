import { useEffect, useState } from "react"
import { Category } from "../../types"
import { getCategories } from "../services"

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true)

      try {
        const data = await getCategories()
        setCategories(data)
      } catch (error) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  return { categories, loading, error }
}
