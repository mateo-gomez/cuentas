import { useMemo } from "react"
import { useTheme } from "./ThemeProvider"
import type { Theme } from "./types"

// Derives a memoized styles object from the active theme. Because `theme` is
// a stable object reference from context (only changes on theme switch),
// this recomputes ONLY on theme change, not on every render.
export function useThemedStyles<T>(factory: (theme: Theme) => T): T {
  const { theme } = useTheme()
  return useMemo(() => factory(theme), [theme])
}
