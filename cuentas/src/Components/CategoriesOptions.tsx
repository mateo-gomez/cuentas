import { FlatList, View } from "react-native"
import { useEffect, useState } from "react"
import Constants from "expo-constants"
import StyledText from "./StyledText"
import { Ionicons } from "@expo/vector-icons"
import { theme } from "../theme"
import { Link } from "react-router-native"
import config from "../config"

const CategoriesOptions = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const getCategories = async () => {
      setLoading(true)

      try {
        const response = await fetch(`${config.apiUrl}/categories`)
        const data = await response.json()

        setCategories(data)
      } catch (error) {
        setError(error.message)
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    getCategories()
  }, [])

  return error ? (
    <StyledText>{error}</StyledText>
  ) : (
    <FlatList
      keyExtractor={({ _id }) => _id}
      data={categories}
      horizontal={false}
      ListHeaderComponent={
        <Link to={"/categories/create"}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingVertical: 10,
              paddingHorizontal: 30,
              backgroundColor: theme.colors.secondary,
            }}
          >
            <StyledText fontSize={"subheading"} color={"white"}>
              {"Categoria"}
            </StyledText>
            <Ionicons
              name={"add"}
              size={25}
              style={{ marginRight: 10 }}
              color={theme.colors.white}
            />
          </View>
        </Link>
      }
      ListEmptyComponent={
        loading ? (
          <StyledText textCenter>Cargando...</StyledText>
        ) : (
          <StyledText textCenter>Sin categorías</StyledText>
        )
      }
      renderItem={({ item: category }) => (
        <Link to={`/categories/${category._id}`}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 10,
              paddingHorizontal: 30,
              backgroundColor: theme.colors.primary,
            }}
          >
            <Ionicons
              name={category.icon}
              size={25}
              style={{ marginRight: 10 }}
              color={theme.colors.white}
            />
            <StyledText fontSize={"subheading"} color={"white"}>
              {category.name}
            </StyledText>
          </View>
        </Link>
      )}
    />
  )
}

export default CategoriesOptions
