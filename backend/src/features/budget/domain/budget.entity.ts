export interface BudgetCategoryAllocation {
  categoryId: string;
  allocated: number;
}

export interface Budget {
  _id?: string;
  userId: string;
  year: number;
  month: number;
  total: number;
  categories: BudgetCategoryAllocation[];
  isCopiedFromPrevious?: boolean;
}

export interface BudgetCategoryStatus {
  categoryId: string;
  allocated: number;
  spent: number;
  remaining: number;
  isOver: boolean;
}

export interface BudgetStatus {
  budget: Budget | null;
  totalSpent: number;
  totalRemaining: number;
  isOverBudget: boolean;
  categories: BudgetCategoryStatus[];
}
