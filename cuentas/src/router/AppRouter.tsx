// Platform-specific implementations live in AppRouter.native.tsx (NativeRouter)
// and AppRouter.web.tsx (BrowserRouter). Metro resolves those by platform; this
// base file is the fallback and the module TypeScript type-checks against.
import { NativeRouter } from "react-router-native"
import type { ReactNode } from "react"

const AppRouter = ({ children }: { children: ReactNode }) => (
  <NativeRouter>{children}</NativeRouter>
)

export default AppRouter
