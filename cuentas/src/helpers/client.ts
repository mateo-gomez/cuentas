import { removeInitialSlash } from "../utils";
import config from "../config";
import { storage } from "./storage";

enum Method {
  POST = "POST",
  PUT = "PUT",
  GET = "GET",
  DELETE = "DELETE",
}

const getToken = async (): Promise<string | null> => {
  try {
    return await storage.getItem("token");
  } catch (error) {
    console.error("Error retrieving token:", error);
    return null;
  }
};

const createRequestInit = async (
  method: Method,
  data?: Record<string, any>,
): Promise<RequestInit> => {
  const token = await getToken();
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const requestInit: RequestInit = { method, headers };

  if (method === Method.POST || method === Method.PUT) {
    requestInit.body = JSON.stringify(data);
  }

  return requestInit;
};

const fetcher = async <T>(
  method: Method,
  endpoint: string,
  data?: Record<string, any>,
): Promise<T> => {
  const normalizedEndpoint = removeInitialSlash(endpoint);
  const url = `${config.apiUrl}/${normalizedEndpoint}`;

  try {
    const init = await createRequestInit(method, data);
    const response = await fetch(url, init);

    const result: T = await response.json();

    if (!response.ok) {
      throw new Error(
        (result && typeof result === "object" && "message" in result
          ? result.message
          : "Ha ocurrido un error inesperado") as string,
      );
    }

    return result;
  } catch (error: any) {
    console.error("Error in fetcher:", { method, url, error });
    throw error;
  }
};

export const client = {
  get: <T>(endpoint: string) => fetcher<T>(Method.GET, endpoint),
  post: <T>(endpoint: string, data: Record<string, any>) =>
    fetcher<T>(Method.POST, endpoint, data),
  put: <T>(endpoint: string, data: Record<string, any>) =>
    fetcher<T>(Method.PUT, endpoint, data),
  delete: <T>(endpoint: string) => fetcher<T>(Method.DELETE, endpoint),
};
