export interface Category {
  _id?: string
  name: string
  icon: string
  createdAt?: Date
  updatedAt?: Date
}

export interface CategoryDTO {
  name: string
  icon: string
}
