import { useCallback, useContext, useEffect, useState } from "react"
import { authContext } from "../contexts/AuthContext"
import {
  changePassword as changePasswordRequest,
  getMe,
  updateMe,
} from "../services"
import { ProfileUpdateDTO } from "../services/profile"
import { isApiError } from "../helpers"
import { createLogger } from "../lib/logger"

const logger = createLogger("useProfile")

/**
 * Non-blocking reconciliation (ADR-5): on mount, fetch GET /auth/me and
 * refresh AuthContext.user with the authoritative fields. This never gates
 * rendering — the storage-hydrated user from useAuth already shows.
 */
export const useProfile = () => {
  const { user, setUser } = useContext(authContext)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const refetch = useCallback(async () => {
    setLoading(true)
    setError("")

    try {
      const me = await getMe()
      setUser(me)
    } catch (error) {
      if (isApiError(error)) {
        logger.error("getMe error", {
          message: error.message,
          statusCode: error.statusCode,
        })
      } else {
        logger.error("getMe error", { error })
      }
      setError(
        error instanceof Error ? error.message : "Error al cargar el perfil",
      )
    } finally {
      setLoading(false)
    }
  }, [setUser])

  useEffect(() => {
    refetch()
  }, [refetch])

  const save = async (data: ProfileUpdateDTO) => {
    setError("")

    try {
      const updated = await updateMe(data)
      setUser(updated)
      return updated
    } catch (error) {
      if (isApiError(error)) {
        logger.error("updateMe error", {
          message: error.message,
          statusCode: error.statusCode,
        })
      } else {
        logger.error("updateMe error", { error })
      }
      setError(
        error instanceof Error ? error.message : "Error al guardar el perfil",
      )
      throw error
    }
  }

  const changePassword = async (
    currentPassword: string,
    newPassword: string,
  ) => {
    setError("")

    try {
      return await changePasswordRequest(currentPassword, newPassword)
    } catch (error) {
      if (isApiError(error)) {
        logger.error("changePassword error", {
          message: error.message,
          statusCode: error.statusCode,
        })
      } else {
        logger.error("changePassword error", { error })
      }
      setError(
        error instanceof Error
          ? error.message
          : "Error al cambiar la contraseña",
      )
      throw error
    }
  }

  return { user, loading, error, refetch, save, changePassword }
}
