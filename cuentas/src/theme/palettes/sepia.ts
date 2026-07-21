import { tokens } from "../tokens"
import type { Theme } from "../types"

// Warm "paper" light theme. Reuses Claro's contrast-verified ink ramp, amount
// colors and category tones; only the surfaces and accent are re-tinted warm.
const palette = {
  bg: "#f3ede1",
  surface: "#fbf7ef",
  surface2: "#f7f1e6",
  surface3: "#ece3d3",
  ink: "#1d1810",
  ink2: "#33302a",
  ink3: "#5f5647",
  ink4: "#8a8069",
  ink5: "#b3a992",
  line: "#e2d9c7",
  line2: "#ece3d3",
  accent: "#a8532f", // terracotta
  accentSoft: "#f0e1d7",
  onAccent: "#ffffff",
  pos: "#0f7a4a",
  posBg: "#e4efe0",
  neg: "#bc2f47",
  negBg: "#f6e4dd",
  warn: "#8a6a00",
  warnBg: "#f6ecca",
  warnInk: "#6b5000",
}

const categoryTones = {
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

export const sepia: Theme = {
  id: "sepia",
  scheme: "light",
  palette,
  categoryTones,
  iconTreatment: "neutral",
  amount: { income: "pos", expense: "ink" },
  fonts: tokens.fonts,
  type: tokens.type,
  numeric: tokens.numeric,
  amountFamily: tokens.amountFamily,
  weight: tokens.weight,
}
