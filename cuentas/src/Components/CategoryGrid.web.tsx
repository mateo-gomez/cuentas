import { useEffect, useMemo, useRef, useState } from "react"
import { StyleProp, Text, ViewStyle } from "react-native"
import CategoryChip from "./CategoryChip"
import grafito from "../theme"
import { Category } from "../../types"

interface Props {
  categories: Category[]
  onSelect: (category: Category) => void
  isSelected: (category: Category) => boolean
  emptyLabel?: string
  style?: StyleProp<ViewStyle>
}

const COLUMNS = 4

/**
 * Web grid with full keyboard support (WAI-ARIA grid pattern): roving tabindex
 * so Tab lands once on the grid, then arrow keys move between cards and
 * Enter/Space selects. Uses real <button>s for native activation semantics.
 * Arrow handling lives on the container and derives the current cell from
 * document.activeElement so it fires regardless of per-button event quirks.
 */
export default function CategoryGrid({
  categories,
  onSelect,
  isSelected,
  emptyLabel = "Sin categorías",
}: Props) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])

  const initialIndex = useMemo(() => {
    const i = categories.findIndex((c) => isSelected(c))
    return i >= 0 ? i : 0
  }, [categories, isSelected])

  const [activeIndex, setActiveIndex] = useState(initialIndex)

  useEffect(() => {
    setActiveIndex(initialIndex)
  }, [initialIndex])

  const focusIndex = (index: number) => {
    const clamped = Math.max(0, Math.min(index, categories.length - 1))
    setActiveIndex(clamped)
    refs.current[clamped]?.focus()
  }

  const onKeyDown = (ev: React.KeyboardEvent) => {
    const arrows = [
      "ArrowRight",
      "ArrowLeft",
      "ArrowDown",
      "ArrowUp",
      "Home",
      "End",
    ]
    if (!arrows.includes(ev.key)) return

    // Which cell has focus right now?
    const focused = refs.current.indexOf(
      document.activeElement as HTMLButtonElement,
    )
    const from = focused >= 0 ? focused : activeIndex

    ev.preventDefault()
    switch (ev.key) {
      case "ArrowRight":
        focusIndex(from + 1)
        break
      case "ArrowLeft":
        focusIndex(from - 1)
        break
      case "ArrowDown":
        focusIndex(from + COLUMNS)
        break
      case "ArrowUp":
        focusIndex(from - COLUMNS)
        break
      case "Home":
        focusIndex(0)
        break
      case "End":
        focusIndex(categories.length - 1)
        break
    }
  }

  if (categories.length === 0) {
    return <Text style={emptyStyle}>{emptyLabel}</Text>
  }

  return (
    <div
      role="grid"
      aria-label="Categorías"
      style={gridStyle}
      onKeyDown={onKeyDown}
    >
      {categories.map((category, index) => {
        const selected = isSelected(category)
        return (
          <button
            key={category._id}
            ref={(el) => {
              refs.current[index] = el
            }}
            type="button"
            role="gridcell"
            aria-label={category.name}
            aria-pressed={selected}
            tabIndex={index === activeIndex ? 0 : -1}
            onClick={() => onSelect(category)}
            style={{
              ...cardStyle,
              borderWidth: selected ? 2 : 1,
              borderColor: selected ? grafito.ink : grafito.line,
            }}
          >
            <CategoryChip
              size="lg"
              categoryId={category._id}
              name={category.name}
              icon={category.icon}
            />
            {category.name ? (
              <span style={cardNameStyle}>{category.name}</span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: `repeat(${COLUMNS}, 1fr)`,
  gap: 8,
  padding: "8px 12px",
}

const cardStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: grafito.surface,
  borderStyle: "solid",
  borderRadius: 12,
  padding: "14px 6px",
  cursor: "pointer",
}

const cardNameStyle: React.CSSProperties = {
  fontSize: 12,
  color: grafito.ink2,
  textAlign: "center",
  marginTop: 6,
  fontFamily: grafito.fonts.sans,
}

const emptyStyle = {
  fontSize: 14,
  color: grafito.ink3,
  textAlign: "center" as const,
  paddingVertical: 24,
}
