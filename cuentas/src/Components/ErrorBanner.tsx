import { View } from "react-native"
import { StyledText } from "./StyledText"
import { useThemedStyles } from "../theme/index"
import type { Theme } from "../theme/index"

interface ErrorBannerProps {
  message: string
}

export const ErrorBanner = ({ message }: ErrorBannerProps) => {
  const styles = useThemedStyles(makeStyles)
  if (!message) return null

  return (
    <View style={styles.container}>
      <StyledText style={styles.icon}>⚠</StyledText>
      <StyledText style={styles.text}>{message}</StyledText>
    </View>
  )
}

const makeStyles = (theme: Theme) => ({
  container: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    backgroundColor: theme.palette.negBg,
    borderLeftWidth: 3,
    borderLeftColor: theme.palette.neg,
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginTop: 16,
  },
  icon: {
    color: theme.palette.neg,
    fontSize: 14,
  },
  text: {
    color: theme.palette.neg,
    fontSize: 14,
    flex: 1,
  },
})
