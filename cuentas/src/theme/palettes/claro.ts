import { tokens } from "../tokens"
import type { Theme } from "../types"

const palette = {
  bg: "#f5f7f6",
  surface: "#ffffff",
  surface2: "#fafbfa",
  surface3: "#eef1f0",
  ink: "#14191a",
  ink2: "#29302f",
  ink3: "#576260",
  ink4: "#869089",
  ink5: "#b3bcb8",
  line: "#e4e8e6",
  line2: "#eef1f0",
  accent: "#0d7d80",
  accentSoft: "#e2f1f0",
  onAccent: "#ffffff",
  pos: "#0f7a4a", // darkened from #17915a to clear WCAG AA (4.5) as amount text
  posBg: "#e2f0e8",
  neg: "#c73652", // darkened carmine to clear WCAG AA (4.5) as amount text
  negBg: "#f9e5ea",
  warn: "#b08900",
  warnBg: "#fff7e0",
  warnInk: "#7a5c00",
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

export const claro: Theme = {
  id: "claro",
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
