import { Platform } from "react-native"
import { useEffect } from "react"
import { useTheme } from "./index"

const isWeb = Platform.OS === "web"
const STYLE_ELEMENT_ID = "app-scrollbar-style"

// Data attribute a scroller opts in with. Spread `scrollbarProps` onto a
// react-native-web ScrollView (via dataSet) to get the themed scrollbar.
export const SCROLLBAR_SELECTOR = "app"

export const scrollbarProps = { dataSet: { scrollbar: SCROLLBAR_SELECTOR } }

// react-native-web renders a real browser scrollbar that RN's
// `showsVerticalScrollIndicator`/`indicatorStyle` can't restyle. This injects a
// single themed stylesheet (thin, rounded, transparent track) and keeps it in
// sync with the active theme so the scrollbar matches light/dark palettes. It's
// a no-op on native, where the platform draws its own indicator.
export const useWebScrollbar = () => {
  const { theme } = useTheme()

  useEffect(() => {
    if (!isWeb || typeof document === "undefined") return

    let element = document.getElementById(
      STYLE_ELEMENT_ID,
    ) as HTMLStyleElement | null

    if (!element) {
      element = document.createElement("style")
      element.id = STYLE_ELEMENT_ID
      document.head.appendChild(element)
    }

    const { ink4, ink3 } = theme.palette
    const attr = `[data-scrollbar="${SCROLLBAR_SELECTOR}"]`

    element.textContent = `
      ${attr} {
        scrollbar-width: thin;
        scrollbar-color: ${ink4} transparent;
      }
      ${attr}::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }
      ${attr}::-webkit-scrollbar-track {
        background: transparent;
      }
      ${attr}::-webkit-scrollbar-thumb {
        background-color: ${ink4};
        border-radius: 8px;
        border: 2px solid transparent;
        background-clip: padding-box;
      }
      ${attr}::-webkit-scrollbar-thumb:hover {
        background-color: ${ink3};
      }
    `
  }, [theme])
}
