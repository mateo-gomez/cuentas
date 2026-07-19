import { Link as DomLink } from "react-router-dom"
import type { AppLinkProps } from "./Link.native"

// underlayColor is a native-only touch feedback prop; drop it on web.
// Reset the default anchor styling so nested RN views render as authored.
const Link = ({ to, children }: AppLinkProps) => (
  <DomLink to={to} style={{ textDecoration: "none", color: "inherit" }}>
    {children}
  </DomLink>
)

export default Link
