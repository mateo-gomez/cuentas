import React from "react"
import { View, Text } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme, useThemedStyles, chipColors, getTone } from "../theme/index"
import type { Theme } from "../theme/index"

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
  const { theme } = useTheme()
  const styles = useThemedStyles(makeStyles)
  const tone = getTone(theme.categoryTones, categoryId)
  const cfg = sizeConfig[size]
  const paint = chipColors(theme, tone)

  return (
    <View
      style={[
        styles.chip,
        {
          backgroundColor: paint.bg,
          borderRadius: cfg.radius,
          height: cfg.height,
          paddingHorizontal: cfg.height * 0.35,
        },
      ]}
    >
      {icon ? (
        <Ionicons name={icon as any} size={cfg.iconSize} color={paint.fg} />
      ) : (
        <Text
          style={[styles.initial, { color: paint.fg, fontSize: cfg.iconSize }]}
        >
          {name.charAt(0).toUpperCase()}
        </Text>
      )}
    </View>
  )
}

const makeStyles = (_theme: Theme) => ({
  chip: {
    alignItems: "center" as const,
    justifyContent: "center" as const,
    flexDirection: "row" as const,
  },
  initial: {
    fontWeight: "600" as const,
  },
})
