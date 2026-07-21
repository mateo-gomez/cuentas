import { StyleSheet, Text, View } from "react-native"
import { useOutletContext } from "react-router"
import CategoryGrid from "../../Components/CategoryGrid"
import { useCategories } from "../../hooks/useCategories"
import { Category } from "../../../types"
import { useThemedStyles } from "../../theme/index"
import type { Theme } from "../../theme/index"

interface UseOutletContext {
  handleSelectCategory: (category: Category) => void
  categoryId: string
}

const Categories = () => {
  const styles = useThemedStyles(makeStyles)
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

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    loadingContainer: {
      alignItems: "center",
      paddingVertical: 24,
    },
    loadingText: {
      fontSize: 14,
      color: theme.palette.ink3,
    },
  })

export default Categories
