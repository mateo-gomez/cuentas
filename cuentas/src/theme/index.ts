import { claro } from "./palettes/claro"
import { oscuro } from "./palettes/oscuro"

export const themes = { claro, oscuro }

export { claro, oscuro }
export * from "./types"
export { tokens } from "./tokens"
export { chipColors, getTone } from "./iconTreatment"
export { ThemeProvider, useTheme } from "./ThemeProvider"
export type { ThemePref } from "./ThemeProvider"
export { useThemedStyles } from "./useThemedStyles"
export { useAmount } from "./useAmount"
