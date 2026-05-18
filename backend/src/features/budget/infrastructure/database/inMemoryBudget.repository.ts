import { Budget, BudgetCategoryAllocation } from "../../domain/budget.entity";
import { IBudgetRepository } from "../../domain/budget.repository";

export class InMemoryBudgetRepository implements IBudgetRepository {
  private budgets: Budget[] = [];

  findByUserAndMonth(userId: string, year: number, month: number): Promise<Budget | null> {
    const budget =
      this.budgets.find(
        (b) => b.userId === userId && b.year === year && b.month === month,
      ) ?? null;
    return Promise.resolve(budget);
  }

  findLatestBefore(userId: string, year: number, month: number): Promise<Budget | null> {
    const prev =
      this.budgets
        .filter(
          (b) =>
            b.userId === userId &&
            (b.year < year || (b.year === year && b.month < month)),
        )
        .sort((a, b) => b.year - a.year || b.month - a.month)[0] ?? null;
    return Promise.resolve(prev);
  }

  upsert(
    userId: string,
    year: number,
    month: number,
    total: number,
    categories: BudgetCategoryAllocation[],
  ): Promise<Budget> {
    const idx = this.budgets.findIndex(
      (b) => b.userId === userId && b.year === year && b.month === month,
    );
    const budget: Budget = {
      _id: Math.random().toString(36).substring(2, 9),
      userId,
      year,
      month,
      total,
      categories,
    };
    if (idx >= 0) {
      this.budgets[idx] = budget;
    } else {
      this.budgets.push(budget);
    }
    return Promise.resolve(budget);
  }
}
