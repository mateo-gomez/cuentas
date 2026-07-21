import React from "react"
import { Text, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme, useThemedStyles, getTone } from "../theme/index"
import type { Theme } from "../theme/index"
import { FrequentCombo } from "../../types"

interface Props {
  combo: FrequentCombo
  onPress: (combo: FrequentCombo) => void
}

export default function SuggestionChip({ combo, onPress }: Props) {
  const { theme } = useTheme()
  const styles = useThemedStyles(makeStyles)
  const tone = getTone(theme.categoryTones, combo.category._id)

  // "Ícono color" treatment: neutral base, category colour carried by the glyph.
  return (
    <TouchableOpacity style={styles.chip} onPress={() => onPress(combo)}>
      {combo.category.icon ? (
        <Ionicons name={combo.category.icon as any} size={14} color={tone.fg} />
      ) : null}
      <Text style={styles.label} numberOfLines={1}>
        {combo.description}
      </Text>
    </TouchableOpacity>
  )
}

const makeStyles = (theme: Theme) => ({
  chip: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: theme.palette.surface3,
    borderWidth: 1,
    borderColor: theme.palette.line,
  },
  label: {
    fontFamily: theme.weight.medium,
    fontSize: 13,
    color: theme.palette.ink2,
    maxWidth: 140,
  },
})
