import { claro } from "./palettes/claro"
import { oscuro } from "./palettes/oscuro"
import { sepia } from "./palettes/sepia"
import { indigo } from "./palettes/indigo"

export const themes = { claro, oscuro, sepia, indigo }

export { claro, oscuro, sepia, indigo }
export * from "./types"
export { tokens } from "./tokens"
export { chipColors, getTone } from "./iconTreatment"
export { ThemeProvider, useTheme } from "./ThemeProvider"
export type { ThemePref } from "./ThemeProvider"
export { useThemedStyles } from "./useThemedStyles"
export { useAmount } from "./useAmount"
