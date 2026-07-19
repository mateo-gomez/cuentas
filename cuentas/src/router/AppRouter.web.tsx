import { BrowserRouter } from "react-router-dom"
import type { ReactNode } from "react"

const AppRouter = ({ children }: { children: ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
)

export default AppRouter
