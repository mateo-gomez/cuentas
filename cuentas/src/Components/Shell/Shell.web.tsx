import { ReactNode, useEffect } from "react"
import { View } from "react-native"
import { useIsWideWeb } from "../../hooks/useIsWideWeb"
import { useTheme, useThemedStyles } from "../../theme/index"
import type { Theme } from "../../theme/index"
import Sidebar from "./Sidebar.web"

// Max width of the content column inside the desktop app-shell. Keeps line
// length and forms readable instead of stretching edge-to-edge.
const CONTENT_MAX = 760

// Sets up the full-height root and a neutral desktop backdrop. Injected once
// (idempotent), then kept in sync with the active theme's bg on every
// theme change so the surrounding page background repaints too.
let styleEl: HTMLStyleElement | null = null
const syncBackdrop = (bg: string) => {
  if (typeof document === "undefined") return

  if (!styleEl) {
    // Opt into safe-area env() insets. Expo's default viewport meta omits
    // `viewport-fit=cover`, so env(safe-area-inset-*) resolves to 0 and
    // react-native-safe-area-context reports no insets on mobile web / PWA.
    const viewport = document.querySelector('meta[name="viewport"]')
    if (viewport) {
      viewport.setAttribute(
        "content",
        "width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover",
      )
    }
    styleEl = document.createElement("style")
    document.head.appendChild(styleEl)
  }

  styleEl.textContent = `
    html, body, #root { height: 100%; }
    body { background-color: ${bg}; }
  `
}

export default function Shell({ children }: { children: ReactNode }) {
  const { theme } = useTheme()
  const styles = useThemedStyles(makeStyles)
  useEffect(() => syncBackdrop(theme.palette.bg), [theme])
  const wide = useIsWideWeb()

  // Narrow web behaves exactly like mobile: full-bleed single column with the
  // bottom tab bar the screens already render.
  if (!wide) return <View style={styles.fill}>{children}</View>

  return (
    <View style={styles.appShell}>
      <Sidebar />
      <View style={styles.main}>
        <View style={styles.content}>{children}</View>
      </View>
    </View>
  )
}

const makeStyles = (theme: Theme) => ({
  fill: { flex: 1 },
  appShell: {
    flex: 1,
    flexDirection: "row" as const,
    backgroundColor: theme.palette.bg,
  },
  main: {
    flex: 1,
    alignItems: "center" as const,
    overflow: "hidden" as const,
  },
  content: {
    flex: 1,
    width: "100%" as const,
    maxWidth: CONTENT_MAX,
  },
})
