import { tokens } from "../tokens"
import type { Theme } from "../types"

// Authored dark palette — NOT an inversion of Claro. Contrast-checked against
// WCAG AA for text-sized use (ink ramp vs bg/surface, category-tone fg vs its
// own bg and vs surface3).
const palette = {
  bg: "#0f1413", // deep teal-tinted near-black
  surface: "#171d1c", // raised card
  surface2: "#1c2322",
  surface3: "#232b2a", // neutral chip base (icon 'tint'/'neutral')
  ink: "#ecf1f0", // primary text (~14:1 on bg)
  ink2: "#d3dbd9",
  ink3: "#9fa9a6", // secondary (~6:1 on surface)
  ink4: "#79837f", // muted labels (~4.5:1 on surface)
  ink5: "#58625f",
  line: "#2b3433",
  line2: "#222a29",
  accent: "#2fb3b0", // brightened teal — #0d7d80 fails contrast on dark
  accentSoft: "#10403f", // dark teal wash for active chips
  onAccent: "#06201f", // dark ink on bright accent
  pos: "#3ad08a", // brightened green (~7:1 on bg)
  posBg: "#123125",
  neg: "#f2647f", // lightened carmine — keeps carmine identity, readable on dark
  negBg: "#3a1c24",
  warn: "#d9a326",
  warnBg: "#33290f",
  warnInk: "#e8c877",
}

// Dark muted pill bg + lightened hue fg, same 10 keys as Claro.
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

export const oscuro: Theme = {
  id: "oscuro",
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
