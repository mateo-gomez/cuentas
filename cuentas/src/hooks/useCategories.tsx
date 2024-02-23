import { useEffect, useState } from "react"
import config from "../config"
import { client } from "../helpers/client"
import { Category } from "../Pages/category/types"

const getCategories = async (): Promise<Category[]> => {
  return await client.get("categories")
}

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
