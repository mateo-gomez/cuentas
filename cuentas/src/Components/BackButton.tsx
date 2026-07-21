import { TouchableOpacity, View } from "react-native"
import { useNavigate } from "react-router"
import { useTheme, useThemedStyles } from "../theme/index"
import type { Theme } from "../theme/index"
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
  size,
  color,
  onPress,
  ...restOfProps
}: BackButtonProps) => {
  const { theme } = useTheme()
  const styles = useThemedStyles(makeStyles)
  const navigate = useNavigate()

  const handlePress = () => {
    onPress && onPress()
    navigate(to)
  }

  return (
    <TouchableOpacity onPress={handlePress}>
      <View style={styles.container} {...restOfProps}>
        <BackArrowIcon
          color={color ?? theme.palette.surface}
          size={size ?? 20}
        />
      </View>
    </TouchableOpacity>
  )
}

const makeStyles = (_theme: Theme) => ({
  container: {
    marginRight: 30,
  },
})
