import { useAuth } from "../hooks/useAuth"
import { Ionicons } from "@expo/vector-icons"
import { TouchableHighlight, View } from "react-native"
import { useTheme, useThemedStyles } from "../theme/index"
import type { Theme } from "../theme/index"
import { StyledText } from "./StyledText"

export const LogoutOption = () => {
  const { theme } = useTheme()
  const styles = useThemedStyles(makeStyles)
  const { logout } = useAuth()

  const handlePress = async () => {
    await logout()
  }

  return (
    <TouchableHighlight style={styles.touchable} onPress={handlePress}>
      <View>
        <View style={styles.iconContainer}>
          <Ionicons
            name="log-out-outline"
            color={theme.palette.accent}
            size={70}
          />
        </View>
        <StyledText textCenter fontSize={"subheading"} fontWeight={"bold"}>
          Cerrar sesión
        </StyledText>
      </View>
    </TouchableHighlight>
  )
}

const makeStyles = (_theme: Theme) => ({
  iconContainer: { alignItems: "center" as const, padding: 10 },
  touchable: { padding: 20 },
})
