import type { TextStyle } from "react-native"

// ─── Teal palette ────────────────────────────────────────────────────────────
// Warm-tinted neutrals + a deep-teal brand accent. Minimalist, single accent.
export const bg = "#f5f7f6"
export const surface = "#ffffff"
export const surface2 = "#fafbfa"
export const surface3 = "#eef1f0"
export const ink = "#14191a"
export const ink2 = "#29302f"
export const ink3 = "#576260"
export const ink4 = "#869089"
export const ink5 = "#b3bcb8"
export const line = "#e4e8e6"
export const line2 = "#eef1f0"
export const accent = "#0d7d80"
export const accentSoft = "#e2f1f0"
export const onAccent = "#ffffff"
export const pos = "#17915a"
export const posBg = "#e2f0e8"
export const neg = "#c9483d"
export const negBg = "#f6e5e1"
export const warn = "#b08900"
export const warnBg = "#fff7e0"
export const warnInk = "#7a5c00"

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

// ─── Category tones ───────────────────────────────────────────────────────────
export const categoryTones = {
  sand: { bg: "#efe6d6", fg: "#7a663a" },
  sage: { bg: "#dfe6da", fg: "#4d5e41" },
  rose: { bg: "#ecdcd7", fg: "#7a4434" },
  sky: { bg: "#d9e1e8", fg: "#38516a" },
  lilac: { bg: "#e3dceb", fg: "#534667" },
  clay: { bg: "#ead8c8", fg: "#7a533a" },
  moss: { bg: "#d6dfd0", fg: "#475a36" },
  fog: { bg: "#dcdfe3", fg: "#4a5260" },
  butter: { bg: "#ebe4cb", fg: "#6f5e26" },
  wine: { bg: "#e3d4d6", fg: "#703c47" },
}

// ─── Legacy named export (used by all existing components) ────────────────────
export const theme = {
  appBar: {
    primary: accent,
    textPrimary: "#FFF",
  },
  fontSizes: {
    small: 12,
    body: 16,
    subheading: 20,
    heading: 28,
  },
  fontWeights: {
    bold: "bold",
    normal: "400",
  },
  fonts: {
    main: "Inter_400Regular",
    sans: "Inter_400Regular",
    serif: "Inter_600SemiBold",
    mono: "Inter_500Medium",
  },
  colors: {
    // Grafito-remapped legacy keys
    background: bg,
    primary: accent,
    secondary: accent,
    white: surface,
    greenLight: pos,
    red: neg,
    // Unchanged legacy keys
    textPrimary: "#747E7E",
    textSecondary: accent,
    grey: "#9da7a7",
    transparent: "transparent",
    highlight: bg,
  },
  flex: {
    center: "center",
    end: "flex-end",
    start: "flex-start",
    between: "flex-between",
    around: "flex-around",
  },
}

// ─── Default export — flat Grafito object (used by new components) ────────────
const grafito = {
  // Palette
  bg,
  surface,
  surface2,
  surface3,
  ink,
  ink2,
  ink3,
  ink4,
  ink5,
  line,
  line2,
  accent,
  accentSoft,
  onAccent,
  pos,
  posBg,
  neg,
  negBg,
  warn,
  warnBg,
  warnInk,
  // Fonts + type system
  fonts,
  type,
  numeric,
  amountFamily,
  weight,
  // Category tones
  categoryTones,
  // Legacy aliases so new components can reference old names if needed
  primary: accent,
  background: bg,
  white: surface,
  greenLight: pos,
  red: neg,
  secondary: accent,
}

export default grafito
