import type { ReactNode } from "react"
import { Link as NativeLink } from "react-router-native"

export type AppLinkProps = {
  to: string
  underlayColor?: string
  children: ReactNode
}

const Link = ({ to, underlayColor, children }: AppLinkProps) => (
  <NativeLink to={to} underlayColor={underlayColor}>
    {children}
  </NativeLink>
)

export default Link
