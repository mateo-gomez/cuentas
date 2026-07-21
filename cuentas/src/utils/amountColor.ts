// Semantic colour model for money amounts — "red is earned, not given".
//
// Expenses are the majority of rows, so painting them all red drains the
// colour of meaning and makes every list look like an alert. Instead:
//   - expense  -> neutral ink (the default, calm)
//   - income   -> positive green (the minority worth highlighting)
//   - negative -> alert red, reserved for genuinely negative state
//                 (a balance below zero, a budget overspend)
//
// Colors themselves now come from `useAmount()` (src/theme/useAmount.ts),
// which resolves them against the active theme. This module only keeps the
// theme-independent sign glyph.

export type AmountKind = "income" | "expense"

// Sign prefix shown before the formatted amount (e.g. "+", "−").
// Uses the real minus glyph, not a hyphen, so it aligns with tabular digits.
export const amountSign = (kind: AmountKind): string =>
  kind === "income" ? "+" : "−"
