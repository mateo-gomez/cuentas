import { NativeRouter } from "react-router-native"
import type { ReactNode } from "react"

const AppRouter = ({ children }: { children: ReactNode }) => (
  <NativeRouter>{children}</NativeRouter>
)

export default AppRouter
