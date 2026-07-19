// ─── Grafito palette ─────────────────────────────────────────────────────────
export const bg = "#f4f5f7"
export const surface = "#ffffff"
export const surface2 = "#fbfbfc"
export const surface3 = "#f1f2f4"
export const ink = "#111214"
export const ink2 = "#2a2d33"
export const ink3 = "#5b5e64"
export const ink4 = "#898d94"
export const ink5 = "#b6b9bf"
export const line = "#e6e7ea"
export const line2 = "#eeeff1"
export const accent = "#1c2024"
export const onAccent = "#ffffff"
export const pos = "#2f6b46"
export const posBg = "#e1ebe4"
export const neg = "#8b3a2e"
export const negBg = "#efdedb"

// ─── Fonts ────────────────────────────────────────────────────────────────────
export const fonts = {
  sans: "System",
  serif: "Georgia",
  mono: "Courier New",
}

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
    primary: "#3F7C85",
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
    main: "System",
    sans: "System",
    serif: "Georgia",
    mono: "Courier New",
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
    textSecondary: "#00CCBF",
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
  onAccent,
  pos,
  posBg,
  neg,
  negBg,
  // Fonts
  fonts,
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
