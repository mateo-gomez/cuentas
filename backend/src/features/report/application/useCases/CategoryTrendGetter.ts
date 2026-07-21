import { TransactionType } from "../../../../domain/valueObjects/transactionType.valueObject";
import { CategoryReportGetter } from "./CategoryReportGetter";
import { CategoryReportItem } from "../dto/categoryReportDTO";
import {
  CategoryTrend,
  CategoryTrendItem,
} from "../dto/categoryTrendDTO";

/**
 * Compares category totals between two consecutive periods (the current
 * range vs. the immediately preceding one of the same length) so the app can
 * surface trends — which categories grew, shrank, or appeared.
 *
 * Delegates the per-range aggregation to CategoryReportGetter, then merges the
 * two result sets on the union of category ids.
 */
export class CategoryTrendGetter {
  constructor(private readonly categoryReportGetter: CategoryReportGetter) {}

  execute = async (
    userId: string,
    currentStart: Date,
    currentEnd: Date,
    previousStart: Date,
    previousEnd: Date,
    type: TransactionType = TransactionType.expenses,
    accountId?: string,
  ): Promise<CategoryTrend> => {
    const [current, previous] = await Promise.all([
      this.categoryReportGetter.execute(
        userId,
        currentStart,
        currentEnd,
        type,
        accountId,
      ),
      this.categoryReportGetter.execute(
        userId,
        previousStart,
        previousEnd,
        type,
        accountId,
      ),
    ]);

    const currentById = this.index(current.items);
    const previousById = this.index(previous.items);
    const categoryIds = new Set([
      ...currentById.keys(),
      ...previousById.keys(),
    ]);

    const items: CategoryTrendItem[] = [...categoryIds]
      .map((id) => {
        const c = currentById.get(id);
        const p = previousById.get(id);
        const meta = c ?? p!;
        const currentTotal = c?.total ?? 0;
        const previousTotal = p?.total ?? 0;

        return {
          categoryId: id,
          name: meta.name,
          icon: meta.icon,
          current: currentTotal,
          previous: previousTotal,
          delta: currentTotal - previousTotal,
          deltaPct: this.pct(currentTotal, previousTotal),
        };
      })
      .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));

    return {
      type,
      currentTotal: current.grandTotal,
      previousTotal: previous.grandTotal,
      delta: current.grandTotal - previous.grandTotal,
      deltaPct: this.pct(current.grandTotal, previous.grandTotal),
      items,
    };
  };

  private index = (
    items: CategoryReportItem[],
  ): Map<string, CategoryReportItem> =>
    new Map(items.map((item) => [item.categoryId, item]));

  // Null when there is no baseline — a percentage off zero is meaningless.
  private pct = (current: number, previous: number): number | null =>
    previous > 0 ? Math.round(((current - previous) / previous) * 10000) / 10000 : null;
}
