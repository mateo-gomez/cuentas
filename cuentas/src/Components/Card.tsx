import { PropsWithChildren } from "react"
import { View, StyleProp, ViewStyle } from "react-native"
import { useThemedStyles } from "../theme/index"
import type { Theme } from "../theme/index"

interface CardProps {
  style?: StyleProp<ViewStyle>
  // Drops the shadow/elevation for a flat surface.
  flat?: boolean
}

// Elevated surface used for grouped content across screens.
export const Card = ({
  children,
  style,
  flat,
}: PropsWithChildren<CardProps>) => {
  const styles = useThemedStyles(makeStyles)
  return (
    <View style={[styles.card, !flat && styles.elevated, style]}>
      {children}
    </View>
  )
}

const makeStyles = (theme: Theme) => ({
  card: {
    backgroundColor: theme.palette.surface,
    borderRadius: 12,
    padding: 16,
  },
  elevated: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
})
