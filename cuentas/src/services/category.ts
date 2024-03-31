import { Category, CategoryDTO } from "../../types"
import { client } from "../helpers"

export const getCategories = async (): Promise<Category[]> => {
  const { data } = await client.get<{ data: Category[] }>("/categories")

  return data
}

export const getCategory = async (
  id: string,
): Promise<Category | null | never> => {
  const { data } = await client.get<{ data: Category | null | never }>(
    `categories/${id}`,
  )

  return data
}

export const updateCategory = async (id: string, category: CategoryDTO) => {
  const { data } = await client.put<{ data: Category }>(
    `categories/${id}`,
    category,
  )
  return data
}

export const createCategory = async (newCategory: CategoryDTO) => {
  const { data } = await client.post<{ data: Category[] }>(
    "/categories",
    newCategory,
  )

  return data
}

export const deleteCategory = async (id: string) => {
  const { data } = await client.delete<{ data: Category }>(`/categories/${id}`)
  return data
}
