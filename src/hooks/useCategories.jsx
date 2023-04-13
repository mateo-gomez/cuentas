import { useEffect, useState } from "react"
import Constants from "expo-constants"

const { apiUrl } = Constants.expoConfig.extra

const useCategories = () => {
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    useEffect(() => {
        const getCategories = async () => {
            setLoading(true)

            try {
                const response = await fetch(`${apiUrl}/categories`)
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

export default useCategories
