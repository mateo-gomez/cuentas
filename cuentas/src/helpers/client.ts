import { removeInitialSlash } from "../utils"
import config from "../config"
import { storage } from "./storage"
import { createLogger } from "../lib/logger"
import { ApiError } from "./ApiError"

const logger = createLogger("client")

// Called when the session can no longer be recovered (refresh failed/invalid).
// Registered by AuthProvider so it can clear the in-memory user and redirect.
let onSessionExpired: (() => void) | null = null

export const setSessionExpiredHandler = (handler: (() => void) | null) => {
  onSessionExpired = handler
}

// Auth endpoints that must never trigger a silent token refresh: the
// unauthenticated entry points plus refresh/logout would loop or re-fail.
const NON_RECOVERABLE_AUTH_ENDPOINTS = [
  "auth/signin",
  "auth/signup",
  "auth/refresh",
  "auth/logout",
]

enum Method {
  POST = "POST",
  PUT = "PUT",
  PATCH = "PATCH",
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

const clearSession = async () => {
  await storage.removeItem("token")
  await storage.removeItem("refreshToken")
  await storage.removeItem("user")
}

// Exchanges the stored refresh token for a fresh access + refresh pair.
// Raw fetch (not the client) so it never recurses through the interceptor.
const requestNewTokens = async (): Promise<boolean> => {
  const refreshToken = await storage.getItem("refreshToken")

  if (!refreshToken) {
    return false
  }

  try {
    const response = await fetch(`${config.apiUrl}/auth/refresh`, {
      method: Method.POST,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    })

    if (!response.ok) {
      return false
    }

    const body = await response.json()
    const tokens = body?.data

    if (!tokens?.token || !tokens?.refreshToken) {
      return false
    }

    await storage.setItem("token", tokens.token)
    await storage.setItem("refreshToken", tokens.refreshToken)
    return true
  } catch (error) {
    logger.error("Token refresh failed", { error })
    return false
  }
}

// Single-flight: many requests can 401 at once, but only one refresh runs.
// The rest await the same promise so tokens rotate exactly once.
let refreshPromise: Promise<boolean> | null = null

const attemptRefresh = (): Promise<boolean> => {
  if (!refreshPromise) {
    refreshPromise = requestNewTokens().finally(() => {
      refreshPromise = null
    })
  }

  return refreshPromise
}

const createRequestInit = async (
  method: Method,
  token: string | null,
  data?: Record<string, any> | FormData,
  headers: Record<string, string> = {},
): Promise<RequestInit> => {
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

  if (method === Method.POST || method === Method.PUT || method === Method.PATCH) {
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
  // Unauthenticated auth endpoints (and refresh/logout) must never trigger a
  // silent refresh — recovering them would loop. Authenticated auth endpoints
  // like me/change-password are recoverable like any other protected route.
  const isNonRecoverableAuthEndpoint = NON_RECOVERABLE_AUTH_ENDPOINTS.some(
    (prefix) => normalizedEndpoint.startsWith(prefix),
  )

  const isSessionError = (status: number) => status === 401 || status === 403

  try {
    const token = await getToken()
    let response = await fetch(
      url,
      await createRequestInit(method, token, data, headers || {}),
    )

    // Access token rejected: silently refresh once and replay the request.
    // Skip non-recoverable auth endpoints so signin/refresh failures never loop.
    const canRecover = !!token && !isNonRecoverableAuthEndpoint
    if (!response.ok && isSessionError(response.status) && canRecover) {
      const refreshed = await attemptRefresh()

      if (refreshed) {
        const newToken = await getToken()
        response = await fetch(
          url,
          await createRequestInit(method, newToken, data, headers || {}),
        )
      }
    }

    const result: T = await response.json()

    if (!response.ok) {
      // Refresh could not recover the session → force the user back to login.
      if (isSessionError(response.status) && canRecover) {
        await clearSession()
        onSessionExpired?.()
      }

      const message = (result && typeof result === "object" && "message" in result
        ? result.message
        : "Ha ocurrido un error inesperado") as string
      const errors = (result && typeof result === "object" && "errors" in result
        ? result.errors
        : undefined) as Record<string, string[]> | undefined
      throw new ApiError(message, response.status, errors)
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
  patch: <T>(endpoint: string, data: Record<string, any>) =>
    fetcher<T>(Method.PATCH, endpoint, data),
  delete: <T>(endpoint: string) => fetcher<T>(Method.DELETE, endpoint),
  upload: <T>(
    endpoint: string,
    data: FormData,
    headers?: Record<string, string>,
  ) => fetcher<T>(Method.POST, endpoint, data, headers),
}
