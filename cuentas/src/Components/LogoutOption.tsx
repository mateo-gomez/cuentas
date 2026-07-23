import { useAuth } from "../hooks/useAuth"
import { Ionicons } from "@expo/vector-icons"
import { Pressable, View } from "react-native"
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
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel="Cerrar sesión"
      style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
    >
      <View style={styles.content}>
        <Ionicons name="log-out-outline" color={theme.palette.neg} size={20} />
        <StyledText color="red" fontWeight="bold">
          Cerrar sesión
        </StyledText>
      </View>
    </Pressable>
  )
}

const makeStyles = (theme: Theme) => ({
  button: {
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.palette.neg,
    backgroundColor: theme.palette.surface,
  },
  buttonPressed: {
    opacity: 0.6,
  },
  content: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 8,
  },
})
