import { User } from "../../types/User"
import { client } from "../helpers"

export interface ProfileUpdateDTO {
  name: string
  surename: string
  lastname: string
}

export const getMe = async (): Promise<User> => {
  const { data } = await client.get<{ data: User }>("/auth/me")

  return data
}

export const updateMe = async (profile: ProfileUpdateDTO): Promise<User> => {
  const { data } = await client.patch<{ data: User }>("/auth/me", profile)

  return data
}

export const changePassword = async (
  currentPassword: string,
  newPassword: string,
): Promise<{ success: boolean }> => {
  const { data } = await client.post<{ data: { success: boolean } }>(
    "/auth/change-password",
    { currentPassword, newPassword },
  )

  return data
}
