import { Category } from "./category"

export interface TransactionAggregate {
  _id: string
  transactions: Transaction[]
  minDate: Date
  maxDate: Date
  balance: {
    incomes: number
    expenses: number
    balance: number
  }
}

export enum TransactionType {
  expenses,
  income,
}

export interface Transaction {
  _id: string
  date: Date
  value: number
  account: string
  category: Category
  type: TransactionType
  description: string
  createdAt: Date
  updatedAt: Date
}

export interface TransactionDTO {
  id?: string
  date: Date
  value: number
  description: string
  category: string
  type: number
}
