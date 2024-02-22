import Constants from "expo-constants"
import { removeInitialSlash } from "../utils"
import config from "../config"

const requestInitData = (method: string, data?: Record<string, any>) => {
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
  get: (endpoint) => fetcher("GET", endpoint),
  post: (endpoint, data) => fetcher("POST", endpoint, data),
  put: (endpoint, data) => fetcher("PUT", endpoint, data),
  delete: (endpoint) => fetcher("DELETE", endpoint),
}

export const fetcher = async (method, endpoint = "", data = {}) => {
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
