import { StyleSheet, Text, View } from "react-native"
import { useOutletContext } from "react-router-native"
import CategoryGrid from "../../Components/CategoryGrid"
import { useCategories } from "../../hooks/useCategories"
import { Category } from "../../../types"
import grafito from "../../theme"

interface UseOutletContext {
  handleSelectCategory: (category: Category) => void
  categoryId: string
}

const Categories = () => {
  const { handleSelectCategory, categoryId } =
    useOutletContext<UseOutletContext>()
  const { categories, loading } = useCategories()

  const currentCategory = categories.find(
    (category) => category._id === categoryId,
  )

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    )
  }

  return (
    <CategoryGrid
      categories={categories}
      onSelect={handleSelectCategory}
      isSelected={(category) =>
        !!currentCategory && category._id === currentCategory._id
      }
    />
  )
}

const styles = StyleSheet.create({
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 24,
  },
  loadingText: {
    fontSize: 14,
    color: grafito.ink3,
  },
})

export default Categories
