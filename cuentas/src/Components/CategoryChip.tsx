import React from "react"
import { View, Text, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import theme from "../theme"

// Hash categoryId → one of 10 tone names
function getTone(id: string) {
  const tones = Object.keys(theme.categoryTones) as Array<
    keyof typeof theme.categoryTones
  >
  let hash = 0
  for (let i = 0; i < id.length; i++)
    hash = (hash * 31 + id.charCodeAt(i)) & 0xffffff
  return theme.categoryTones[tones[hash % tones.length]]
}

type Size = "sm" | "md" | "lg"

interface Props {
  categoryId: string
  name: string
  icon?: string // Ionicons name
  size?: Size
}

const sizeConfig: Record<
  Size,
  { height: number; radius: number; iconSize: number; fontSize: number }
> = {
  sm: { height: 28, radius: 8, iconSize: 12, fontSize: 11 },
  md: { height: 36, radius: 11, iconSize: 16, fontSize: 13 },
  lg: { height: 52, radius: 16, iconSize: 22, fontSize: 13 },
}

export default function CategoryChip({
  categoryId,
  name,
  icon,
  size = "md",
}: Props) {
  const tone = getTone(categoryId)
  const cfg = sizeConfig[size]

  // "Ícono color" treatment: a neutral base with the category colour carried
  // only by the glyph. Keeps per-category identity without the multi-colour
  // pill in every list row competing with the amounts.
  return (
    <View
      style={[
        styles.chip,
        {
          backgroundColor: theme.surface3,
          borderRadius: cfg.radius,
          height: cfg.height,
          paddingHorizontal: cfg.height * 0.35,
        },
      ]}
    >
      {icon ? (
        <Ionicons name={icon as any} size={cfg.iconSize} color={tone.fg} />
      ) : (
        <Text
          style={[styles.initial, { color: tone.fg, fontSize: cfg.iconSize }]}
        >
          {name.charAt(0).toUpperCase()}
        </Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  chip: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  initial: {
    fontWeight: "600",
  },
})
