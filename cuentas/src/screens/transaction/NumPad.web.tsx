import { StyleSheet, Text, View } from "react-native"
import { useOutletContext } from "react-router"
import CategoryGrid from "../../Components/CategoryGrid"
import { useCategories } from "../../hooks/useCategories"
import { Category } from "../../../types"
import { useTheme, useThemedStyles } from "../../theme/index"
import type { Theme } from "../../theme/index"

interface NumpadOutletContext {
  commitWithCategory: (category: Category) => void
  isValidTransactionValue: () => boolean
  categoryId?: string
}

// Web replaces the on-screen numpad with inline category selection. The amount
// is a focusable input above (see AmountInput.web), so the whole flow is
// keyboard-only: type amount → Tab through fields → Enter on a category to save.
const NumPad = () => {
  const styles = useThemedStyles(makeStyles)
  const { commitWithCategory, isValidTransactionValue, categoryId } =
    useOutletContext<NumpadOutletContext>()

  const { categories, loading } = useCategories()

  const handleSelect = (category: Category) => {
    if (!isValidTransactionValue()) return
    commitWithCategory(category)
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    )
  }

  return (
    <View>
      <Text style={styles.hint}>
        Escribí el monto y elegí una categoría para guardar (Enter)
      </Text>
      <CategoryGrid
        categories={categories}
        onSelect={handleSelect}
        isSelected={(category) => !!categoryId && category._id === categoryId}
      />
    </View>
  )
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
  hint: {
    fontSize: 13,
    color: theme.palette.ink3,
    textAlign: "center",
    marginBottom: 12,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 24,
  },
  loadingText: {
    fontSize: 14,
    color: theme.palette.ink3,
  },
  })

export default NumPad
