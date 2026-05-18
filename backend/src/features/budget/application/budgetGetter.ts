import { TransactionType } from "../../../domain/valueObjects/transactionType.valueObject";
import { TransactionRepository } from "../../transaction/domain/Transaction.repository";
import { Budget, BudgetCategoryStatus, BudgetStatus } from "../domain/budget.entity";
import { IBudgetRepository } from "../domain/budget.repository";

export class BudgetGetter {
  constructor(
    private readonly budgetRepository: IBudgetRepository,
    private readonly transactionRepository: TransactionRepository,
  ) {}

  execute = async (userId: string, year: number, month: number): Promise<BudgetStatus> => {
    let budget = await this.budgetRepository.findByUserAndMonth(userId, year, month);
    let isCopiedFromPrevious = false;

    if (!budget) {
      const prev = await this.budgetRepository.findLatestBefore(userId, year, month);
      if (prev) {
        budget = { ...prev, _id: undefined, year, month, isCopiedFromPrevious: true };
        isCopiedFromPrevious = true;
      }
    }

    if (!budget) {
      return { budget: null, totalSpent: 0, totalRemaining: 0, isOverBudget: false, categories: [] };
    }

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);
    const transactions = await this.transactionRepository.getBetweenDates(start, end);

    const expenses = transactions.filter((t) => t.type === TransactionType.expenses);

    const spentByCategory = new Map<string, number>();
    let totalSpent = 0;

    for (const tx of expenses) {
      const catId = tx.category._id;
      spentByCategory.set(catId, (spentByCategory.get(catId) ?? 0) + tx.value);
      totalSpent += tx.value;
    }

    const categories: BudgetCategoryStatus[] = budget.categories.map((alloc) => {
      const spent = spentByCategory.get(alloc.categoryId) ?? 0;
      spentByCategory.delete(alloc.categoryId);
      return {
        categoryId: alloc.categoryId,
        allocated: alloc.allocated,
        spent,
        remaining: alloc.allocated - spent,
        isOver: spent > alloc.allocated,
      };
    });

    for (const [categoryId, spent] of spentByCategory) {
      categories.push({ categoryId, allocated: 0, spent, remaining: -spent, isOver: true });
    }

    const budgetResult: Budget = isCopiedFromPrevious
      ? { ...budget, isCopiedFromPrevious: true }
      : budget;

    return {
      budget: budgetResult,
      totalSpent,
      totalRemaining: budget.total - totalSpent,
      isOverBudget: totalSpent > budget.total,
      categories,
    };
  };
}
