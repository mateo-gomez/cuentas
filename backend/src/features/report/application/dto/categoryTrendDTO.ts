import { TransactionType } from "../../../../domain/valueObjects/transactionType.valueObject";

/** One category's movement between the previous period and the current one. */
export interface CategoryTrendItem {
  categoryId: string;
  name: string;
  icon: string;
  current: number;
  previous: number;
  /** current - previous. Positive = spent/earned more than before. */
  delta: number;
  /**
   * Relative change, (current - previous) / previous.
   * Null when there is no previous baseline (previous === 0) — the category
   * is new this period and a percentage would be meaningless/infinite.
   */
  deltaPct: number | null;
}

export interface CategoryTrend {
  type: TransactionType;
  currentTotal: number;
  previousTotal: number;
  delta: number;
  deltaPct: number | null;
  /** Items sorted by absolute delta, descending — biggest movers first. */
  items: CategoryTrendItem[];
}
