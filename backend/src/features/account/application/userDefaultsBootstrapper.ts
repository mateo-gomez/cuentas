import { AccountRepository } from "../domain/account.repository";
import { DEFAULT_ACCOUNT_NAME } from "../domain/defaultAccount";
import { CategoryRepository } from "../../category/domain/category.repository";
import { DEFAULT_CATEGORIES } from "../../category/domain/defaultCategories";
import { DuplicateError } from "../../../infrastructure/api/errors/duplicateError";

export interface UserDefaultsBootstrapResult {
  defaultAccountId: string;
}

// Lazy, idempotent per-user defaults provisioning (account-management design §4).
// Triggered at signin/signup (see AuthController). Replaces the old global
// CategorySeeder boot call — categories and the "Sin asignar" account are now
// seeded per user, on demand, instead of once globally at process start.
export class UserDefaultsBootstrapper {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly categoryRepository: CategoryRepository,
  ) {}

  ensureFor = async (userId: string): Promise<UserDefaultsBootstrapResult> => {
    const defaultAccountId = await this.ensureDefaultAccount(userId);
    await this.ensureDefaultCategories(userId);

    return { defaultAccountId };
  };

  private ensureDefaultAccount = async (userId: string): Promise<string> => {
    const existing = await this.accountRepository.getByNameForUser(
      userId,
      DEFAULT_ACCOUNT_NAME,
    );

    if (existing) {
      return existing._id;
    }

    try {
      const created = await this.accountRepository.create(userId, {
        name: DEFAULT_ACCOUNT_NAME,
        type: "bank",
        openingBalance: 0,
      });

      return created._id;
    } catch (error) {
      // Race: another concurrent request already created it — treat as exists.
      if (error instanceof DuplicateError) {
        const raced = await this.accountRepository.getByNameForUser(
          userId,
          DEFAULT_ACCOUNT_NAME,
        );

        if (raced) {
          return raced._id;
        }
      }

      throw error;
    }
  };

  private ensureDefaultCategories = async (userId: string): Promise<void> => {
    for (const { name, icon } of DEFAULT_CATEGORIES) {
      const existing = await this.categoryRepository.getByNameForUser(userId, name);

      if (existing) {
        continue;
      }

      try {
        await this.categoryRepository.createCategory(userId, name, icon);
      } catch (error) {
        if (error instanceof DuplicateError) {
          continue;
        }

        throw error;
      }
    }
  };
}
