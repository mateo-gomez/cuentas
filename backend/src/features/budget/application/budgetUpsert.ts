import { Budget, BudgetCategoryAllocation } from "../domain/budget.entity";
import { IBudgetRepository } from "../domain/budget.repository";

export interface BudgetUpsertDTO {
  year: number;
  month: number;
  total: number;
  categories: BudgetCategoryAllocation[];
}

export class BudgetUpsert {
  constructor(private readonly budgetRepository: IBudgetRepository) {}

  execute = async (userId: string, dto: BudgetUpsertDTO): Promise<Budget> => {
    return this.budgetRepository.upsert(userId, dto.year, dto.month, dto.total, dto.categories);
  };
}
