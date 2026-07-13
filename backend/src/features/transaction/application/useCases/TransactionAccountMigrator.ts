import { TransactionRepository } from "../../domain/Transaction.repository";
import { CategoryRepository } from "../../../category/domain/category.repository";

// One-time, self-idempotent global backfill (account-management design §5).
// Single-owner DB assumption: everything ownerless is attributed to the
// first user who signs in after this change ships. Guarded by an `exists`
// check per collection so it becomes a no-op on every subsequent run.
export class TransactionAccountMigrator {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly categoryRepository: CategoryRepository,
  ) {}

  migrateForUser = async (
    userId: string,
    defaultAccountId: string,
  ): Promise<void> => {
    const hasOwnerlessTransactions =
      await this.transactionRepository.hasOwnerlessTransactions();

    if (hasOwnerlessTransactions) {
      await this.transactionRepository.migrateOwnerlessTransactions(
        userId,
        defaultAccountId,
      );
    }

    const hasOwnerlessCategories =
      await this.categoryRepository.hasOwnerlessCategories();

    if (hasOwnerlessCategories) {
      await this.categoryRepository.migrateOwnerlessCategories(userId);
    }
  };
}
