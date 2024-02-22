import { type Transaction } from "../Pages/Transaction"
import { formatDate } from "./formatDate"

export interface GroupedTransaction {
  title: string
  data: Transaction[]
}
export type AccGroupTransactions = {
  [x: string]: GroupedTransaction
}

export const groupTransactions = (transactions: Transaction[], key: string) => {
  const grouped = transactions.reduce(
    (acc: AccGroupTransactions, item: Transaction): AccGroupTransactions => {
      const date = formatDate(item[key], {
        day: "2-digit",
        month: "long",
      })
      const dataGroup: Transaction[] = date in acc ? acc[date].data : []

      dataGroup.push(item)
      acc[date] = { title: date, data: dataGroup }

      return acc as AccGroupTransactions
    },
    {},
  )

  return Object.values(grouped)
}
