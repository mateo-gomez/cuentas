import { tokens } from "../tokens"
import type { Theme } from "../types"

// Indigo-tinted dark theme. Reuses Oscuro's contrast-verified light ink ramp,
// amount colors and category tones; only the surfaces and accent shift to a
// cool indigo/periwinkle identity (distinct from Oscuro's teal).
const palette = {
  bg: "#0f1020",
  surface: "#17182b",
  surface2: "#1c1d33",
  surface3: "#242641",
  ink: "#edecf5",
  ink2: "#d6d5e6",
  ink3: "#a3a2bd",
  ink4: "#7d7c96",
  ink5: "#5a5972",
  line: "#2c2d47",
  line2: "#222339",
  accent: "#8b93ff", // bright periwinkle
  accentSoft: "#23264d",
  onAccent: "#0f1020",
  pos: "#3ad08a",
  posBg: "#123125",
  neg: "#f2647f",
  negBg: "#3a1c24",
  warn: "#d9a326",
  warnBg: "#33290f",
  warnInk: "#e8c877",
}

const categoryTones = {
  sand: { bg: "#332f22", fg: "#d8c18c" },
  sage: { bg: "#252e22", fg: "#a9c199" },
  rose: { bg: "#33241f", fg: "#d9a08c" },
  sky: { bg: "#1f2a33", fg: "#8fb3cf" },
  lilac: { bg: "#2a2533", fg: "#b6a6cf" },
  clay: { bg: "#332a20", fg: "#d3a985" },
  moss: { bg: "#242d20", fg: "#9cbe86" },
  fog: { bg: "#252a30", fg: "#9aa4b2" },
  butter: { bg: "#302c1c", fg: "#cdba7f" },
  wine: { bg: "#2f2226", fg: "#cf9aa4" },
}

export const indigo: Theme = {
  id: "indigo",
  scheme: "dark",
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
