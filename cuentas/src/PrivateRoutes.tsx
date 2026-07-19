// crea un componente de autenticación protegido que obtene la autenticación del usuario y redirige a la pantalla de inicio de sesión si no hay una autenticación

import { Navigate, Outlet, Route, Routes as Router } from "react-router"
import Home from "./screens/home"
import Login from "./screens/auth/Login"
import { useAuth } from "./hooks/useAuth"

const PrivateRoutes = () => {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" />
  }

  return <Outlet />
}

export default PrivateRoutes
