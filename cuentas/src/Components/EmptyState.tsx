import { ReactNode } from "react"
import { View } from "react-native"
import { useThemedStyles } from "../theme/index"
import type { Theme } from "../theme/index"
import { StyledText } from "./StyledText"

interface EmptyStateProps {
  message: string
  icon?: ReactNode
}

// Centered placeholder for empty lists / no-data states.
export const EmptyState = ({ message, icon }: EmptyStateProps) => {
  const styles = useThemedStyles(makeStyles)
  return (
    <View style={styles.container}>
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      <StyledText color="grey" textCenter>
        {message}
      </StyledText>
    </View>
  )
}

const makeStyles = (_theme: Theme) => ({
  container: {
    flex: 1,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    padding: 32,
    gap: 12,
  },
  icon: {
    opacity: 0.6,
  },
})
