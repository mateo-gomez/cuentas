import grafito from "../theme"

// Semantic colour model for money amounts — "red is earned, not given".
//
// Expenses are the majority of rows, so painting them all red drains the
// colour of meaning and makes every list look like an alert. Instead:
//   - expense  -> neutral ink (the default, calm)
//   - income   -> positive green (the minority worth highlighting)
//   - negative -> alert red, reserved for genuinely negative state
//                 (a balance below zero, a budget overspend)
//
// Use `amountColor` for a transaction row (by its kind) and
// `balanceColor` for aggregate figures where the sign itself is the signal.

export type AmountKind = "income" | "expense"

export const amountColor = (kind: AmountKind): string =>
  kind === "income" ? grafito.pos : grafito.ink

// For totals/balances: red only when the value is actually negative.
export const balanceColor = (value: number): string =>
  value < 0 ? grafito.neg : grafito.ink

// Sign prefix shown before the formatted amount (e.g. "+", "−").
// Uses the real minus glyph, not a hyphen, so it aligns with tabular digits.
export const amountSign = (kind: AmountKind): string =>
  kind === "income" ? "+" : "−"
