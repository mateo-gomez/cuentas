import { createContext, useState } from "react"
import { User } from "../../types/User"

export const authContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState<User>()

  return (
    <authContext.Provider value={{ user, setUser }}>
      {children}
    </authContext.Provider>
  )
}
