import type { tokens } from "./tokens"

export type Palette = {
  bg: string
  surface: string
  surface2: string
  surface3: string
  ink: string
  ink2: string
  ink3: string
  ink4: string
  ink5: string
  line: string
  line2: string
  accent: string
  accentSoft: string
  onAccent: string
  pos: string
  posBg: string
  neg: string
  negBg: string
  warn: string
  warnBg: string
  warnInk: string
}

export type CategoryTone = { bg: string; fg: string }

export type CategoryTones = Record<
  | "sand"
  | "sage"
  | "rose"
  | "sky"
  | "lilac"
  | "clay"
  | "moss"
  | "fog"
  | "butter"
  | "wine",
  CategoryTone
>

// Icon treatment: how CategoryChip/Icon/SuggestionChip paint category icons.
export type IconTreatment = "color" | "tint" | "neutral"

// Amount-color model: resolves per-kind color; balance uses palette.neg when
// negative, else palette.ink.
export type AmountModel = {
  income: keyof Palette | string
  expense: keyof Palette | string
}

export type Theme = {
  id: "claro" | "oscuro" | "sepia" | "indigo"
  scheme: "light" | "dark"
  palette: Palette
  categoryTones: CategoryTones
  iconTreatment: IconTreatment
  amount: AmountModel
  // Invariant tokens (same object reference across all themes):
  fonts: typeof tokens.fonts
  type: typeof tokens.type
  numeric: typeof tokens.numeric
  amountFamily: string
  weight: typeof tokens.weight
}
