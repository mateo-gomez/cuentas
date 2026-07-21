import { Ionicons } from "@expo/vector-icons"
import { StyleProp, TextStyle } from "react-native"
import { categoryIcons } from "../constants"
import { useTheme } from "../theme/index"

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
  const { theme } = useTheme()
  return (
    <Ionicons
      name={categoryIcons[name] ?? "help-outline"}
      size={size ?? 25}
      style={style}
      color={color || theme.palette.surface}
    />
  )
}
