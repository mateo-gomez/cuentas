import React from "react"
import { StyleSheet, Text, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import theme from "../theme"
import { FrequentCombo } from "../../types"

// Hash categoryId -> one of 10 tone names — mirrors CategoryChip's getTone so
// suggestion chips visually match their category color elsewhere in the app.
function getTone(id: string) {
  const tones = Object.keys(theme.categoryTones) as Array<
    keyof typeof theme.categoryTones
  >
  let hash = 0
  for (let i = 0; i < id.length; i++)
    hash = (hash * 31 + id.charCodeAt(i)) & 0xffffff
  return theme.categoryTones[tones[hash % tones.length]]
}

interface Props {
  combo: FrequentCombo
  onPress: (combo: FrequentCombo) => void
}

export default function SuggestionChip({ combo, onPress }: Props) {
  const tone = getTone(combo.category._id)

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

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: theme.surface3,
    borderWidth: 1,
    borderColor: theme.line,
  },
  label: {
    fontFamily: theme.weight.medium,
    fontSize: 13,
    color: theme.ink2,
    maxWidth: 140,
  },
})
