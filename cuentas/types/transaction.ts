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
  accountId?: string
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
  accountId: string
}

export interface FrequentCombo {
  description: string
  type: TransactionType
  accountId: string
  category: {
    _id: string
    name: string
    icon: string
  }
  count: number
}
