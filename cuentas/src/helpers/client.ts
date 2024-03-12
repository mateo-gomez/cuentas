import { removeInitialSlash } from "../utils"
import config from "../config"

enum Method {
  POST = "POST",
  PUT = "PUT",
  GET = "GET",
  DELETE = "DELETE",
}

const requestInitData = (method: Method, data?: Record<string, any>) => {
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
  }

  if (method === Method.PUT || method === Method.POST)
    return {
      method,
      headers,
      body: JSON.stringify(data),
    }

  return {
    method,
    headers,
  }
}

export const client = {
  get: <T>(endpoint: string) => fetcher<T>(Method.GET, endpoint),
  post: <T>(endpoint: string, data: Record<string, any>) =>
    fetcher<T>(Method.POST, endpoint, data),
  put: <T>(endpoint: string, data: Record<string, any>) =>
    fetcher<T>(Method.PUT, endpoint, data),
  delete: <T>(endpoint: string) => fetcher<T>(Method.DELETE, endpoint),
}

export const fetcher = async <T>(method: Method, endpoint = "", data = {}) => {
  const normalizedEndpoint = removeInitialSlash(endpoint)
  const url = `${config.apiUrl}/${normalizedEndpoint}`

  const response = await fetch(url, requestInitData(method, data))

  let result: T

  try {
    result = await response.json()
  } catch (error) {
    console.log({ status: response.status, response })
    throw new Error("Error parsing server response")
  }

  if (!response.ok) {
    const error = new Error(
      result?.message || "Ha ocurrido un error inesperado",
    )

    error.errors = result

    throw error
  }

  return result
}
