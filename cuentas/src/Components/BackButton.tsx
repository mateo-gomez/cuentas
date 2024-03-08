import { StyleSheet, TouchableOpacity, View } from "react-native"
import { useNavigate } from "react-router-native"
import { theme } from "../theme"
import BackArrowIcon from "./svg/BackArrowIcon"

interface BackButtonProps {
  to?: number
  size?: number
  color?: string
  onPress?: () => void
  [x: string]: any
}

export const BackButton = ({
  to = -1,
  size = theme.fontSizes.subheading,
  color = theme.colors.white,
  onPress,
  ...restOfProps
}: BackButtonProps) => {
  const navigate = useNavigate()

  const handlePress = () => {
    onPress && onPress()
    navigate(to)
  }

  return (
    <TouchableOpacity onPress={handlePress}>
      <View style={styles.container} {...restOfProps}>
        <BackArrowIcon color={color} size={size} />
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    marginRight: 30,
  },
})
