import { claro } from "../palettes/claro"
import { oscuro } from "../palettes/oscuro"
import { sepia } from "../palettes/sepia"
import { indigo } from "../palettes/indigo"
import type { Theme } from "../types"

// WCAG 2.1 contrast verification for the color palettes. Turns the "authored,
// AA-ish" comments in the palette files into a tool-checked guarantee so a
// future palette tweak that breaks readability fails CI instead of shipping.
//
// Thresholds:
//   - Body/amount TEXT vs its background: >= 4.5 (AA normal text)
//   - Icon-glyph / large-UI pairs (category fg on chip bg): >= 3.0 (AA large)

const TEXT_AA = 4.5
const LARGE_AA = 3.0

function channel(c: number): number {
  const s = c / 255
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
}

function luminance(hex: string): number {
  const h = hex.replace("#", "")
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

function contrast(fg: string, bg: string): number {
  const l1 = luminance(fg)
  const l2 = luminance(bg)
  const [hi, lo] = l1 >= l2 ? [l1, l2] : [l2, l1]
  return (hi + 0.05) / (lo + 0.05)
}

function checkPalette(theme: Theme) {
  const p = theme.palette

  // Primary/secondary text ramp must read on both bg and cards.
  for (const surface of [p.bg, p.surface, p.surface2]) {
    expect(contrast(p.ink, surface)).toBeGreaterThanOrEqual(TEXT_AA)
    expect(contrast(p.ink2, surface)).toBeGreaterThanOrEqual(TEXT_AA)
    expect(contrast(p.ink3, surface)).toBeGreaterThanOrEqual(TEXT_AA)
  }

  // Amount colors are text-sized — they must clear normal-text AA on the
  // surfaces amounts actually render on (screen bg + cards).
  for (const surface of [p.bg, p.surface]) {
    expect(contrast(p.pos, surface)).toBeGreaterThanOrEqual(TEXT_AA)
    expect(contrast(p.neg, surface)).toBeGreaterThanOrEqual(TEXT_AA)
  }

  // Button/label text sitting on the accent fill.
  expect(contrast(p.onAccent, p.accent)).toBeGreaterThanOrEqual(TEXT_AA)

  // Category icon glyphs: the tinted fg on its own pill and on the neutral
  // chip base (surface3) used by the tint/neutral treatments.
  for (const tone of Object.values(theme.categoryTones)) {
    expect(contrast(tone.fg, tone.bg)).toBeGreaterThanOrEqual(LARGE_AA)
    expect(contrast(tone.fg, p.surface3)).toBeGreaterThanOrEqual(LARGE_AA)
  }
}

describe("palette contrast (WCAG AA)", () => {
  it("Claro meets AA for text and icon pairs", () => {
    checkPalette(claro)
  })

  it("Oscuro meets AA for text and icon pairs", () => {
    checkPalette(oscuro)
  })

  it("Sepia meets AA for text and icon pairs", () => {
    checkPalette(sepia)
  })

  it("Índigo meets AA for text and icon pairs", () => {
    checkPalette(indigo)
  })
})
