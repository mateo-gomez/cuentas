import { Transaction } from "../../types/transaction"
import { formatDate } from "./formatDate"

export interface GroupedTransaction {
  title: string
  data: Transaction[]
}
export type AccGroupTransactions = {
  [x: string]: GroupedTransaction
}

export const groupTransactions = (transactions: Transaction[]) => {
  const grouped = transactions.reduce(
    (acc: AccGroupTransactions, item: Transaction): AccGroupTransactions => {
      const date = item.date
      const currentYear = new Date().getFullYear()
      const isCurrentYear = currentYear === date.getFullYear()
      const formattedDate = formatDate(date, {
        day: "2-digit",
        month: "long",
        year: !isCurrentYear ? "numeric" : undefined,
      })

      const dataGroup: Transaction[] =
        formattedDate in acc ? acc[formattedDate].data : []

      dataGroup.push(item)
      acc[formattedDate] = {
        title: formattedDate,
        data: dataGroup,
      }

      return acc as AccGroupTransactions
    },
    {},
  )

  return Object.values(grouped)
}
