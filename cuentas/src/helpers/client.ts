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

  if (method === "PUT" || method === "POST")
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
  get: (endpoint: string) => fetcher(Method.GET, endpoint),
  post: (endpoint: string, data: Record<string, any>) =>
    fetcher(Method.POST, endpoint, data),
  put: (endpoint: string, data: Record<string, any>) =>
    fetcher(Method.PUT, endpoint, data),
  delete: (endpoint: string) => fetcher(Method.DELETE, endpoint),
}

export const fetcher = async (method: Method, endpoint = "", data = {}) => {
  const normalizedEndpoint = removeInitialSlash(endpoint)
  const url = `${config.apiUrl}/${normalizedEndpoint}`

  const response = await fetch(url, requestInitData(method, data))

  let result

  try {
    result = await response.json()
  } catch (error) {
    console.log({ status: response.status })
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
