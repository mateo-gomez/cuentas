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
      // `category` is populated with `.lean()`, so `_id` is a Mongo ObjectId at
      // runtime (the domain type lies). Stringify so equal categories share one
      // Map key instead of one entry per ObjectId instance.
      const catId = String(tx.category._id);
      spentByCategory.set(catId, (spentByCategory.get(catId) ?? 0) + tx.value);
      totalSpent += tx.value;
    }

    // Merge allocations by categoryId (also an ObjectId at runtime) so the client
    // never receives two status entries (and two identical React keys) for the
    // same category.
    const allocatedByCategory = new Map<string, number>();
    for (const alloc of budget.categories) {
      const catId = String(alloc.categoryId);
      allocatedByCategory.set(
        catId,
        (allocatedByCategory.get(catId) ?? 0) + alloc.allocated,
      );
    }

    const categories: BudgetCategoryStatus[] = [...allocatedByCategory].map(
      ([categoryId, allocated]) => {
        const spent = spentByCategory.get(categoryId) ?? 0;
        spentByCategory.delete(categoryId);
        return {
          categoryId,
          allocated,
          spent,
          remaining: allocated - spent,
          isOver: spent > allocated,
        };
      },
    );

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
