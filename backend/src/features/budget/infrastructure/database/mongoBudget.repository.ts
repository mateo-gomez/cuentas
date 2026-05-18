import { Budget, BudgetCategoryAllocation } from "../../domain/budget.entity";
import { IBudgetRepository } from "../../domain/budget.repository";
import BudgetModel from "./Budget";

export class MongoBudgetRepository implements IBudgetRepository {
  async findByUserAndMonth(userId: string, year: number, month: number): Promise<Budget | null> {
    const doc = await BudgetModel.findOne({ userId, year, month }).lean();
    if (!doc) return null;
    return this.toEntity(doc);
  }

  async findLatestBefore(userId: string, year: number, month: number): Promise<Budget | null> {
    const doc = await BudgetModel.findOne({
      userId,
      $or: [{ year: { $lt: year } }, { year, month: { $lt: month } }],
    })
      .sort({ year: -1, month: -1 })
      .lean();
    if (!doc) return null;
    return this.toEntity(doc);
  }

  async upsert(
    userId: string,
    year: number,
    month: number,
    total: number,
    categories: BudgetCategoryAllocation[],
  ): Promise<Budget> {
    const doc = await BudgetModel.findOneAndUpdate(
      { userId, year, month },
      { userId, year, month, total, categories },
      { upsert: true, new: true },
    ).lean();
    return this.toEntity(doc!);
  }

  private toEntity(doc: any): Budget {
    return {
      _id: doc._id.toString(),
      userId: doc.userId.toString(),
      year: doc.year,
      month: doc.month,
      total: doc.total,
      categories: (doc.categories ?? []).map((c: any) => ({
        categoryId: c.categoryId.toString(),
        allocated: c.allocated,
      })),
    };
  }
}
