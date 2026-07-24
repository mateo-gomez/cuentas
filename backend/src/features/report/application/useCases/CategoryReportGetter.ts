import { TransactionRepository } from "../../../transaction/domain/Transaction.repository";
import { Transaction } from "../../../transaction/domain/transaction.entity";
import { TransactionType } from "../../../../domain/valueObjects/transactionType.valueObject";
import {
  CategoryReport,
  CategoryReportItem,
} from "../dto/categoryReportDTO";

/**
 * Aggregates transactions of a single side (expenses by default) by category
 * over a date range, ranked by total. Transfer legs are excluded — an
 * account-to-account move is neither a real gain nor a real expense.
 *
 * Aggregation runs in-application over the range's transactions (already
 * category-populated by the repository). For a personal-finance dataset the
 * per-range volume is small, so this stays simple and fully testable without
 * a bespoke aggregation pipeline.
 */
export class CategoryReportGetter {
  constructor(private readonly transactionRepository: TransactionRepository) {}

  execute = async (
    userId: string,
    startDate: Date,
    endDate: Date,
    type: TransactionType = TransactionType.expenses,
    accountId?: string,
  ): Promise<CategoryReport> => {
    const transactions = await this.transactionRepository.getBetweenDates(
      userId,
      startDate,
      endDate,
      accountId,
    );

    const relevant = transactions.filter(
      (t) => t.type === type && !t.isTransfer && t.category != null,
    );

    const byCategory = new Map<string, CategoryReportItem>();
    for (const t of relevant) {
      // category._id is a populated Mongoose ObjectId at runtime (the entity
      // type says string but the repo does not map it). A Map keyed by the
      // ObjectId object compares by reference, so two distinct ObjectId
      // instances with the same value never dedupe — coerce to string.
      const key = String(t.category._id);
      const item = byCategory.get(key) ?? this.emptyItem(t);
      item.total += t.value;
      item.count += 1;
      byCategory.set(key, item);
    }

    const grandTotal = relevant.reduce((sum, t) => sum + t.value, 0);

    const items = [...byCategory.values()]
      .map((item) => ({
        ...item,
        share: grandTotal > 0 ? this.round(item.total / grandTotal) : 0,
      }))
      .sort((a, b) => b.total - a.total);

    return {
      type,
      grandTotal,
      top: items[0] ?? null,
      items,
    };
  };

  private emptyItem = (t: Transaction): CategoryReportItem => ({
    categoryId: String(t.category._id),
    name: t.category.name,
    icon: t.category.icon,
    total: 0,
    count: 0,
    share: 0,
  });

  private round = (n: number): number => Math.round(n * 10000) / 10000;
}
