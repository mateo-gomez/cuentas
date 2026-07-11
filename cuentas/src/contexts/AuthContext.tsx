import { createContext, useEffect, useState } from "react"
import { User } from "../../types/User"
import { setSessionExpiredHandler } from "../helpers/client"

export const authContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState<User>()

  useEffect(() => {
    // When the API reports the session expired, drop the user so PrivateRoutes
    // redirects back to /login.
    setSessionExpiredHandler(() => setUser(null))
    return () => setSessionExpiredHandler(null)
  }, [])

  return (
    <authContext.Provider value={{ user, setUser }}>
      {children}
    </authContext.Provider>
  )
}
