import { StyleSheet, TouchableOpacity, View } from "react-native"
import { useNavigate } from "react-router-native"
import { theme } from "../theme"
import BackArrowIcon from "./svg/BackArrowIcon"

export interface BackButtonProps {
  to?: number
  size?: number
  color?: string
  [x: string]: any
}

const BackButton = ({
  to = -1,
  size = theme.fontSizes.subheading,
  color = theme.colors.white,
  ...restOfProps
}: BackButtonProps) => {
  const navigate = useNavigate()

  const handlePress = () => {
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

export default BackButton
