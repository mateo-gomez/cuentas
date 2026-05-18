import { removeInitialSlash } from "../utils"
import config from "../config"
import { storage } from "./storage"
import { createLogger } from "../lib/logger"

const logger = createLogger("client")
enum Method {
  POST = "POST",
  PUT = "PUT",
  GET = "GET",
  DELETE = "DELETE",
}

const getToken = async (): Promise<string | null> => {
  try {
    return await storage.getItem("token")
  } catch (error) {
    logger.error("Error retrieving token", { error })
    return null
  }
}

const createRequestInit = async (
  method: Method,
  data?: Record<string, any> | FormData,
  headers: Record<string, string> = {},
): Promise<RequestInit> => {
  const token = await getToken()
  const isFormData = data instanceof FormData

  const defaultHeaders: Record<string, string> = {
    Accept: "application/json",
    ...headers,
  }

  if (!isFormData) {
    defaultHeaders["Content-Type"] = "application/json"
  }

  if (token) {
    defaultHeaders.Authorization = `Bearer ${token}`
  }

  const requestInit: RequestInit = {
    method,
    headers: defaultHeaders,
  }

  if (method === Method.POST || method === Method.PUT) {
    requestInit.body = isFormData ? data : JSON.stringify(data)
  }

  return requestInit
}

const fetcher = async <T>(
  method: Method,
  endpoint: string,
  data?: Record<string, any> | FormData,
  headers?: Record<string, string>,
): Promise<T> => {
  const normalizedEndpoint = removeInitialSlash(endpoint)
  const url = `${config.apiUrl}/${normalizedEndpoint}`

  try {
    const init = await createRequestInit(method, data, headers || {})
    const response = await fetch(url, init)

    const result: T = await response.json()

    if (!response.ok) {
      throw new Error(
        (result && typeof result === "object" && "message" in result
          ? result.message
          : "Ha ocurrido un error inesperado") as string,
      )
    }

    return result
  } catch (error: any) {
    logger.error("Error in fetcher", { method, url, error: error?.message ?? error })
    throw error
  }
}

export const client = {
  get: <T>(endpoint: string) => fetcher<T>(Method.GET, endpoint),
  post: <T>(endpoint: string, data: Record<string, any>) =>
    fetcher<T>(Method.POST, endpoint, data),
  put: <T>(endpoint: string, data: Record<string, any>) =>
    fetcher<T>(Method.PUT, endpoint, data),
  delete: <T>(endpoint: string) => fetcher<T>(Method.DELETE, endpoint),
  upload: <T>(
    endpoint: string,
    data: FormData,
    headers?: Record<string, string>,
  ) => fetcher<T>(Method.POST, endpoint, data, headers),
}
