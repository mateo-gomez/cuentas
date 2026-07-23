import { PropsWithChildren } from "react"
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native"
import { StatusBar } from "expo-status-bar"
import { useTheme, useThemedStyles } from "../theme/index"
import type { Theme } from "../theme/index"

interface AuthLayoutProps {
  // Wraps the card in a ScrollView (needed when the form is tall, e.g. Signup).
  scroll?: boolean
}

// Shared shell for the auth screens: keyboard avoidance, status bar, themed bg
// and a centered max-width card.
export const AuthLayout = ({
  children,
  scroll,
}: PropsWithChildren<AuthLayoutProps>) => {
  const { theme } = useTheme()
  const styles = useThemedStyles(makeStyles)

  const card = <View style={styles.card}>{children}</View>

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <StatusBar style={theme.scheme === "dark" ? "light" : "dark"} />
      {scroll ? (
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {card}
        </ScrollView>
      ) : (
        <View style={styles.centered}>{card}</View>
      )}
    </KeyboardAvoidingView>
  )
}

const makeStyles = (theme: Theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.palette.bg,
  },
  centered: {
    flex: 1,
    justifyContent: "center" as const,
    padding: 24,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: "center" as const,
    padding: 24,
  },
  card: {
    width: "100%" as const,
    maxWidth: 420,
    alignSelf: "center" as const,
  },
})
