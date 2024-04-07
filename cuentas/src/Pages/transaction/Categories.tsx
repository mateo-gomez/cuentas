import { useOutletContext } from "react-router-native"
import { CategoryList, StyledText } from "../../Components"
import { useCategories } from "../../hooks/useCategories"
import { Category } from "../../../types"
import { View } from "react-native"

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

  return (
    <View style={{ alignItems: "center" }}>
      {loading ? (
        <StyledText>Cargando...</StyledText>
      ) : (
        <CategoryList
          highlightCriteria={(category) =>
            currentCategory && category._id === currentCategory._id
          }
          categories={categories}
          onSelect={handleSelectCategory}
        />
      )}
    </View>
  )
}

export default Categories
