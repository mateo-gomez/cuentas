import { useContext, useEffect, useState } from "react"
import { authContext } from "../contexts/AuthContext"
import {
  checkUserLogged,
  loginWithEmailAndPassword,
  registerWithEmailAndPassword,
  signOut,
} from "../services/auth"
import { useNavigate } from "react-router-native"
import { UserDTO } from "../../types/User"
import { isApiError, storage } from "../helpers"
import { createLogger } from "../lib/logger"

const logger = createLogger("useAuth")

export const useAuth = () => {
  const { user, setUser } = useContext(authContext)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      navigate("/", { replace: true })
    }
  }, [user])

  useEffect(() => {
    checkUserLogged().then((auth) => {
      if (auth) {
        setUser(auth.user)
      }
    })
  }, [])

  const login = async ({
    email,
    password,
  }: {
    email: string
    password: string
  }) => {
    try {
      setError("")
      const auth = await loginWithEmailAndPassword(email, password)

      if (auth) {
        storage.setItem("token", auth.token)
        storage.setItem("user", JSON.stringify(auth.user))
        setUser(auth.user)
      }
    } catch (error) {
      if (isApiError(error)) {
        logger.error("login error", { message: error.message, statusCode: error.statusCode, errors: error.errors })
      } else {
        logger.error("login error", { error })
      }
      setError(error instanceof Error ? error.message : "Error al iniciar sesión")
    }
  }

  const register = async (newUser: UserDTO) => {
    try {
      setError("")
      const auth = await registerWithEmailAndPassword(newUser)

      if (auth) {
        storage.setItem("token", auth.token)
        storage.setItem("user", JSON.stringify(auth.user))
        setUser(auth.user)
      }
    } catch (error) {
      if (isApiError(error)) {
        logger.error("register error", { message: error.message, statusCode: error.statusCode, errors: error.errors })
      } else {
        logger.error("register error", { error })
      }
      setError(error instanceof Error ? error.message : "Error al registrarse")
    }
  }

  const logout = async () => {
    await storage.removeItem("token")
    await storage.removeItem("user")
    setUser(null)
    signOut()
  }

  return { user, login, register, logout, error }
}
