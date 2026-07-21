import type { CategoryTone, CategoryTones, Theme } from "./types"

// Hash a categoryId into one of the 10 category tone names — shared so
// CategoryChip/CategoryIcon/SuggestionChip render the same tone for the same
// category regardless of the active theme's actual tone values.
export function getTone(categoryTones: CategoryTones, id: string): CategoryTone {
  const tones = Object.keys(categoryTones) as Array<keyof CategoryTones>
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) & 0xffffff
  return categoryTones[tones[hash % tones.length]]
}

// Centralizes color/tint/neutral resolution for category icon chips so
// CategoryChip, CategoryIcon and SuggestionChip stay in lockstep with the
// active theme's `iconTreatment`.
export function chipColors(theme: Theme, tone: CategoryTone): { bg: string; fg: string } {
  switch (theme.iconTreatment) {
    case "color":
      return { bg: tone.bg, fg: tone.fg }
    case "tint":
      return { bg: theme.palette.surface3, fg: tone.fg }
    case "neutral":
    default:
      return { bg: theme.palette.surface3, fg: theme.palette.ink3 }
  }
}
