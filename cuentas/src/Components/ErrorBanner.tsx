import { View, StyleSheet } from "react-native"
import { StyledText } from "./StyledText"
import { theme } from "../theme"

interface ErrorBannerProps {
  message: string
}

export const ErrorBanner = ({ message }: ErrorBannerProps) => {
  if (!message) return null

  return (
    <View style={styles.container}>
      <StyledText style={styles.icon}>⚠</StyledText>
      <StyledText style={styles.text}>{message}</StyledText>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFF0F0",
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.red,
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginTop: 16,
  },
  icon: {
    color: theme.colors.red,
    fontSize: 14,
  },
  text: {
    color: "#C0392B",
    fontSize: 14,
    flex: 1,
  },
})
