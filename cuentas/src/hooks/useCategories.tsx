import { useEffect, useState } from "react"
import Constants from "expo-constants"

const { apiUrl } = Constants.expoConfig.extra

export const useCategories = () => {
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    useEffect(() => {
        const getCategories = async () => {
            setLoading(true)

            const url = `${apiUrl}/categories`

            try {
                const response = await fetch(url)
                const data = await response.json()

                setCategories(data)
            } catch (error) {
                setError(error.message)
            } finally {
                setLoading(false)
            }
        }

        getCategories()
    }, [])

    return { categories, loading, error }
}