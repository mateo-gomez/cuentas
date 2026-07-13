import { Account, AccountBalance, AccountDTO } from "../../types"
import { client } from "../helpers"

export const getAccounts = async (): Promise<Account[]> => {
  const { data } = await client.get<{ data: Account[] }>("/accounts")

  return data
}

export const getAccount = async (
  id: string,
): Promise<Account | null | never> => {
  const { data } = await client.get<{ data: Account | null | never }>(
    `accounts/${id}`,
  )

  return data
}

export const getAccountBalance = async (
  id: string,
): Promise<AccountBalance> => {
  const { data } = await client.get<{ data: AccountBalance }>(
    `accounts/${id}/balance`,
  )

  return data
}

export const createAccount = async (newAccount: AccountDTO) => {
  const { data } = await client.post<{ data: Account }>(
    "/accounts",
    newAccount,
  )

  return data
}

export const updateAccount = async (id: string, account: AccountDTO) => {
  const { data } = await client.put<{ data: Account }>(
    `accounts/${id}`,
    account,
  )
  return data
}

export const deleteAccount = async (id: string) => {
  const { data } = await client.delete<{ data: Account }>(`/accounts/${id}`)
  return data
}
