import { useAuth } from "../hooks/useAuth"
import { Ionicons } from "@expo/vector-icons"
import { StyleSheet, TouchableHighlight, View } from "react-native"
import { theme } from "../theme"
import { StyledText } from "./StyledText"

export const LogoutOption = () => {
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
            color={theme.colors.primary}
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

const styles = StyleSheet.create({
  iconContainer: { alignItems: "center", padding: 10 },
  touchable: { padding: 20 },
})
