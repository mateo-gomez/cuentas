export type AccountType = "bank" | "credit"

export interface Account {
  _id: string
  userId?: string
  name: string
  type: AccountType
  openingBalance: number
  cutoffDay?: number
  dueDay?: number
  createdAt?: Date
  updatedAt?: Date
}

export interface AccountDTO {
  name: string
  type: AccountType
  openingBalance: number
  cutoffDay?: number
  dueDay?: number
}

export interface AccountBalance {
  accountId: string
  openingBalance: number
  incomes: number
  expenses: number
  movementsBalance: number
  balance: number
}
