import { ReactNode, useEffect } from "react"
import { StyleSheet, View } from "react-native"
import { useIsWideWeb } from "../../hooks/useIsWideWeb"
import grafito from "../../theme"
import Sidebar from "./Sidebar.web"

// Max width of the content column inside the desktop app-shell. Keeps line
// length and forms readable instead of stretching edge-to-edge.
const CONTENT_MAX = 760

// Sets up the full-height root and a neutral desktop backdrop. Injected once,
// web-only, idempotent.
let injected = false
const injectBackdrop = () => {
  if (injected || typeof document === "undefined") return
  injected = true

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

  const style = document.createElement("style")
  style.textContent = `
    html, body, #root { height: 100%; }
    body { background-color: ${grafito.bg}; }
  `
  document.head.appendChild(style)
}

export default function Shell({ children }: { children: ReactNode }) {
  useEffect(injectBackdrop, [])
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

const styles = StyleSheet.create({
  fill: { flex: 1 },
  appShell: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: grafito.bg,
  },
  main: {
    flex: 1,
    alignItems: "center",
    overflow: "hidden",
  },
  content: {
    flex: 1,
    width: "100%",
    maxWidth: CONTENT_MAX,
  },
})
