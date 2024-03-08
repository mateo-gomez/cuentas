import { Category, CategoryDTO } from "../../types"
import { client } from "../helpers"

export const getCategories = async (): Promise<Category[]> => {
  return client.get("/categories")
}

export const getCategory = async (
  id: string,
): Promise<Category | null | never> => {
  return await client.get(`categories/${id}`)
}

export const updateCategory = async (id: string, category: CategoryDTO) => {
  return await client.put<Category>(`categories/${id}`, category)
}

export const createCategory = async (newCategory: CategoryDTO) => {
  return await client.post<Category[]>("/categories", newCategory)
}

export const deleteCategory = async (id: string) => {
  return await client.delete<Category>(`/categories/${id}`)
}
