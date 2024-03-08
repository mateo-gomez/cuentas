import { Ionicons } from "@expo/vector-icons"
import { StyleProp, TextStyle } from "react-native"
import { categoryIcons } from "../constants"
import { theme } from "../theme"

export const CategoryIcon = ({
  name,
  size,
  style,
  color,
}: {
  name: string
  size?: number
  style?: StyleProp<TextStyle>
  color?: string
}) => {
  return (
    <Ionicons
      name={categoryIcons[name] ?? "help-outline"}
      size={size ?? 25}
      style={style}
      color={color || theme.colors.white}
    />
  )
}
