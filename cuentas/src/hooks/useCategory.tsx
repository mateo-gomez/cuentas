import { useEffect, useState } from "react"
import Constants from "expo-constants"
import config from "../config"

export const useCategory = (id) => {
  const [category, setCategory] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const getCategories = async () => {
      if (!id) null

      setLoading(true)

      const url = `${config.apiUrl}/categories/${id}`

      try {
        const response = await fetch(url)
        const data = await response.json()

        if (response.status === 404) {
          throw new Error(data.error)
        }

        setCategory(data)
      } catch (error) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    getCategories()
  }, [])

  return { category, loading, error }
}
