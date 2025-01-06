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
import { storage } from "../helpers"

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
      const auth = await loginWithEmailAndPassword(email, password)

      if (auth) {
        storage.setItem("token", auth.token)
        storage.setItem("user", JSON.stringify(auth.user))
        setUser(auth.user)
      }
    } catch (error) {
      const errorCode = error.code

      console.error("login error", error)

      if (errorCode === "auth/user-not-found") {
        setError("El usuario no existe")
      }

      if (errorCode === "auth/wrong-password") {
        setError("La contraseña es incorrecta")
      }

      if (errorCode === "auth/user-disabled") {
        setError("El usuario ha sido deshabilitado")
      }

      if (errorCode === "auth/invalid-email") {
        setError("El correo no es valido")
      }

      if (errorCode === "auth/weak-password") {
        setError("La contraseña es muy debil")
      }

      if (errorCode === "auth/email-already-in-use") {
        setError("El correo ya existe")
      }

      if (errorCode === "auth/operation-not-allowed") {
        setError("La operación no es permitida")
      }

      if (errorCode === "auth/missing-password") {
        setError("La contraseña es requerida")
      }

      if (errorCode === "auth/missing-email") {
        setError("El correo es requerido")
      }

      if (errorCode === "auth/invalid-email") {
        setError("El correo no es valido")
      }

      if (errorCode === "auth/invalid-credentials") {
        setError("Credenciales no validas")
      }
    }
  }

  const register = async (newUser: UserDTO) => {
    const auth = await registerWithEmailAndPassword(newUser)

    if (auth) {
      storage.setItem("token", auth.token)
      storage.setItem("user", JSON.stringify(auth.user))
      setUser(auth.user)
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
