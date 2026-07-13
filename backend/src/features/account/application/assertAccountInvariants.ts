import { AccountCreationData, AccountUpdateData } from "../domain/account.repository";
import { ValidationError } from "../../../infrastructure/api/errors/validationError";

const isValidDay = (day: unknown): day is number =>
  typeof day === "number" && day >= 1 && day <= 31;

/**
 * Shared credit-account invariant guard used by both accountCreator and
 * accountUpdater. For `type: 'credit'`, cutoffDay/dueDay are required and
 * must be within 1..31. For `type: 'bank'`, both fields are stripped so
 * they are never persisted/validated.
 */
export const assertAccountInvariants = <
  T extends AccountCreationData | AccountUpdateData,
>(
  data: T,
): T => {
  if (data.type === "credit") {
    if (!isValidDay(data.cutoffDay) || !isValidDay(data.dueDay)) {
      throw new ValidationError()
        .addError("cutoffDay", "cutoffDay es requerido (1-31) para cuentas de crédito")
        .addError("dueDay", "dueDay es requerido (1-31) para cuentas de crédito");
    }

    return data;
  }

  if (data.type === "bank") {
    return { ...data, cutoffDay: undefined, dueDay: undefined };
  }

  return data;
};
