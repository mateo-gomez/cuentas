import { useOutletContext } from "react-router-native"
import CategoryList from "../Components/CategoryList"
import { useCategories } from "../hooks/useCategories"

const Categories = () => {
  const { handleSelectCategory } = useOutletContext()
  const { categories } = useCategories()

  return (
    <CategoryList categories={categories} onSelect={handleSelectCategory} />
  )
}

export default Categories
