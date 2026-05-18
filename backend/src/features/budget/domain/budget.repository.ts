import { Budget, BudgetCategoryAllocation } from "./budget.entity";

export interface IBudgetRepository {
  findByUserAndMonth(userId: string, year: number, month: number): Promise<Budget | null>;
  findLatestBefore(userId: string, year: number, month: number): Promise<Budget | null>;
  upsert(
    userId: string,
    year: number,
    month: number,
    total: number,
    categories: BudgetCategoryAllocation[],
  ): Promise<Budget>;
}
