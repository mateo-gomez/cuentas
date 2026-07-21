import { CategoryReport, CategoryTrend } from "../../types"
import { client } from "../helpers"

export type ReportSide = "expense" | "income"

export const getCategoryReport = async ({
  start,
  end,
  accountId,
  type = "expense",
}: {
  start: Date
  end: Date
  accountId?: string
  type?: ReportSide
}): Promise<CategoryReport> => {
  const params = new URLSearchParams({
    start: start.toJSON(),
    end: end.toJSON(),
    type,
  })
  if (accountId) params.append("accountId", accountId)

  const { data } = await client.get<{ data: CategoryReport }>(
    `/reports/categories?${params.toString()}`,
  )

  return data
}

export const getCategoryTrend = async ({
  year,
  month,
  accountId,
  type = "expense",
}: {
  /** Full year, e.g. 2026. */
  year: number
  /** 1-12 (calendar month, not 0-based). */
  month: number
  accountId?: string
  type?: ReportSide
}): Promise<CategoryTrend> => {
  const params = new URLSearchParams({
    year: String(year),
    month: String(month),
    type,
  })
  if (accountId) params.append("accountId", accountId)

  const { data } = await client.get<{ data: CategoryTrend }>(
    `/reports/categories/trends?${params.toString()}`,
  )

  return data
}
