import { Platform, useWindowDimensions } from "react-native"

// Width past which the web build switches from the mobile layout (bottom tab
// bar, single column) to the desktop app-shell (left sidebar + wide content).
export const WIDE_WEB_BREAKPOINT = 900

// True only on the web build at desktop widths. Native always returns false so
// the mobile layout is untouched.
export const useIsWideWeb = () => {
  const { width } = useWindowDimensions()
  return Platform.OS === "web" && width >= WIDE_WEB_BREAKPOINT
}
