import { useOutletContext } from "react-router-native"
import CategoryList from "../Components/CategoryList"
import { useCategories } from "../hooks/useCategories"
import { Category } from "./category/types"

interface UseOutletContext {
  handleSelectCategory: (category: Category) => void
  categoryId: string
}

const Categories = () => {
  const { handleSelectCategory, categoryId } =
    useOutletContext<UseOutletContext>()
  const { categories } = useCategories()

  const currentCategory = categories.find(
    (category) => category._id === categoryId,
  )
  console.log({ selection: currentCategory, categoryId })
  return (
    <CategoryList
      highlightCriteria={(category) =>
        currentCategory && category._id === currentCategory._id
      }
      categories={categories}
      onSelect={handleSelectCategory}
    />
  )
}

export default Categories
