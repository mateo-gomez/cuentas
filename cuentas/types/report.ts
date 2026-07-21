export interface CategoryReportItem {
  categoryId: string
  name: string
  icon: string
  total: number
  count: number
  /** Share of the grand total, 0..1. */
  share: number
}

/** type: 0 = expenses, 1 = income (mirrors the backend TransactionType enum). */
export interface CategoryReport {
  type: number
  grandTotal: number
  top: CategoryReportItem | null
  items: CategoryReportItem[]
}

export interface CategoryTrendItem {
  categoryId: string
  name: string
  icon: string
  current: number
  previous: number
  delta: number
  /** (current - previous) / previous. Null when there's no baseline. */
  deltaPct: number | null
}

export interface CategoryTrend {
  type: number
  currentTotal: number
  previousTotal: number
  delta: number
  deltaPct: number | null
  /** Sorted by absolute delta, descending — biggest movers first. */
  items: CategoryTrendItem[]
}
