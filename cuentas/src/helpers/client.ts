import Constants from "expo-constants"
import { removeInitialSlash } from "../utils"

const { apiUrl } = Constants.expoConfig.extra

export const client = {
  get: (endpoint) => fetcher("GET", endpoint),
  post: (endpoint, data) => fetcher("POST", endpoint, data),
  put: (endpoint, data) => fetcher("PUT", endpoint, data),
  delete: (endpoint) => fetcher("DELETE", endpoint),
}

export const fetcher = async (method, endpoint = "", data = {}) => {
  const normalizedEndpoint = removeInitialSlash(endpoint)
  const url = `${apiUrl}/${normalizedEndpoint}`

  const response = await fetch(url, {
    method,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  let result

  try {
    result = await response.json()
  } catch (error) {
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
