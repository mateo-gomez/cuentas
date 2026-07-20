import { View, StyleSheet } from "react-native"
import { StyledText } from "./StyledText"
import grafito from "../theme"

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
    backgroundColor: grafito.negBg,
    borderLeftWidth: 3,
    borderLeftColor: grafito.neg,
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginTop: 16,
  },
  icon: {
    color: grafito.neg,
    fontSize: 14,
  },
  text: {
    color: grafito.neg,
    fontSize: 14,
    flex: 1,
  },
})
