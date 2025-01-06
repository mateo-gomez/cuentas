import { client, storage } from "../helpers";
import { Auth } from "../../types/Auth";
import { UserDTO } from "../../types/User";

export const registerWithEmailAndPassword = async (user: UserDTO) => {
  try {
    const { data } = await client.post<{ data: Auth }>(
      "/auth/signup",
      user,
    );

    return data;
  } catch (error) {
    console.error("register error", error);

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
    console.error("login error", error);

    throw error;
  }
};

export const signOut = async () => {
  await storage.removeItem("token");
};

export const checkUserLogged = async () => {
  const token = await storage.getItem("token");
  const user = await storage.getItem("user");

  if (token && user) {
    return { token, user: JSON.parse(user) };
  }

  return null;
};
