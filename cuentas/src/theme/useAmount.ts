import { useTheme } from "./ThemeProvider"
import { amountSign, type AmountKind } from "../utils/amountColor"
import type { Palette, Theme } from "./types"

function resolve(theme: Theme, key: keyof Palette | string): string {
  return (theme.palette as Record<string, string>)[key] ?? theme.palette.ink
}

// Derives amount/balance colors from the active theme at render time.
export function useAmount() {
  const { theme } = useTheme()
  return {
    amountColor: (kind: AmountKind): string =>
      kind === "income"
        ? resolve(theme, theme.amount.income)
        : resolve(theme, theme.amount.expense),
    balanceColor: (value: number): string =>
      value < 0 ? theme.palette.neg : theme.palette.ink,
    amountSign,
  }
}

export type { AmountKind }
