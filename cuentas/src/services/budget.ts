import { BudgetStatus, BudgetUpsertDTO, Budget } from "../../types"
import { client } from "../helpers"

export const getBudget = async (
  year: number,
  month: number,
): Promise<BudgetStatus> => {
  const { data } = await client.get<{ data: BudgetStatus }>(
    `/budget?year=${year}&month=${month}`,
  )
  return data
}

export const saveBudget = async (dto: BudgetUpsertDTO): Promise<Budget> => {
  const { data } = await client.put<{ data: Budget }>(
    "/budget",
    dto as unknown as Record<string, unknown>,
  )
  return data
}
