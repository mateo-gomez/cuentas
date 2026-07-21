import { TransactionType } from "../../../../domain/valueObjects/transactionType.valueObject";

/** Aggregated spending (or income) for a single category over a date range. */
export interface CategoryReportItem {
  categoryId: string;
  name: string;
  icon: string;
  /** Sum of transaction values for this category in the range. */
  total: number;
  /** Number of transactions that make up the total. */
  count: number;
  /** Share of the grand total, 0..1. Rounded to 4 decimals. */
  share: number;
}

export interface CategoryReport {
  /** Which side was aggregated. Expenses by default. */
  type: TransactionType;
  /** Sum of every item's total. */
  grandTotal: number;
  /** Category with the highest total, or null when there is no data. */
  top: CategoryReportItem | null;
  /** Items sorted by total, descending. */
  items: CategoryReportItem[];
}
