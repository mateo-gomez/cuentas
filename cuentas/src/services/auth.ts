import { client, storage } from "../helpers";
import { Auth } from "../../types/Auth";
import { UserDTO } from "../../types/User";
import { createLogger } from "../lib/logger";

const logger = createLogger("auth.service");

export const registerWithEmailAndPassword = async (user: UserDTO) => {
  try {
    const { data } = await client.post<{ data: Auth }>(
      "/auth/signup",
      user,
    );

    return data;
  } catch (error) {
    logger.error("register error", { error });

    throw error;
  }
};

export const loginWithEmailAndPassword = async (
  email: string,
  password: string,
) => {
  try {
    const { data } = await client.post<{ data: Auth }>(
      "/auth/signin",
      {
        email,
        password,
      },
    );

    return data;
  } catch (error) {
    logger.error("login error", { error });

    throw error;
  }
};

export const signOut = async () => {
  // Best-effort revoke on the backend so the refresh token can't be reused.
  try {
    const refreshToken = await storage.getItem("refreshToken");
    if (refreshToken) {
      await client.post("/auth/logout", { refreshToken });
    }
  } catch (error) {
    logger.error("logout revoke error", { error });
  }

  await storage.removeItem("token");
  await storage.removeItem("refreshToken");
  await storage.removeItem("user");
};

export const checkUserLogged = async () => {
  const token = await storage.getItem("token");
  const user = await storage.getItem("user");

  if (token && user) {
    return { token, user: JSON.parse(user) };
  }

  return null;
};
