import type { TextStyle } from "react-native"

// ─── Fonts ────────────────────────────────────────────────────────────────────
// Inter, bundled via @expo-google-fonts/inter (loaded in App.tsx).
// Legacy keys are remapped so the whole app adopts Inter without per-screen
// edits: `serif` (used for headings/amounts) now maps to a heavier weight.
export const fonts = {
  sans: "Inter_400Regular",
  serif: "Inter_600SemiBold",
  mono: "Inter_500Medium",
}

// ─── Type scale ───────────────────────────────────────────────────────────────
// One source of truth for size + family + weight. Prefer these over ad-hoc
// fontSize/fontWeight so hierarchy stays consistent across screens.
export const type = {
  display: { fontFamily: "Inter_700Bold", fontSize: 34, lineHeight: 40, letterSpacing: -0.5 },
  title: { fontFamily: "Inter_600SemiBold", fontSize: 20, lineHeight: 26, letterSpacing: -0.2 },
  subtitle: { fontFamily: "Inter_600SemiBold", fontSize: 16, lineHeight: 22 },
  body: { fontFamily: "Inter_400Regular", fontSize: 16, lineHeight: 22 },
  bodyStrong: { fontFamily: "Inter_500Medium", fontSize: 16, lineHeight: 22 },
  label: { fontFamily: "Inter_500Medium", fontSize: 13, lineHeight: 16, letterSpacing: 0.2 },
  caption: { fontFamily: "Inter_400Regular", fontSize: 12, lineHeight: 16 },
} as const

// ─── Numbers ──────────────────────────────────────────────────────────────────
// Spread `numeric` onto any Text that renders a money amount so digits are
// fixed-width and align vertically down a column. This is the single most
// important detail for a finance list — never render an amount without it.
export const numeric: Pick<TextStyle, "fontVariant"> = {
  fontVariant: ["tabular-nums"],
}
export const amountFamily = "Inter_600SemiBold"

// Weights as named constants (avoids magic strings scattered in styles).
export const weight = {
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semibold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
} as const

export const tokens = {
  fonts,
  type,
  numeric,
  amountFamily,
  weight,
}
