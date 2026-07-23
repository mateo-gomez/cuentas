import { PropsWithChildren } from "react"
import { View, StyleProp, ViewStyle } from "react-native"
import { useThemedStyles } from "../theme/index"
import type { Theme } from "../theme/index"

interface ScreenProps {
  // Applies horizontal padding (16). Pass a number for a custom amount.
  padded?: boolean | number
  style?: StyleProp<ViewStyle>
}

// Root container for a screen: fills the viewport and paints the themed bg.
export const Screen = ({
  children,
  padded,
  style,
}: PropsWithChildren<ScreenProps>) => {
  const styles = useThemedStyles(makeStyles)
  const padStyle =
    padded === true
      ? styles.padded
      : typeof padded === "number"
      ? { paddingHorizontal: padded }
      : null

  return <View style={[styles.container, padStyle, style]}>{children}</View>
}

const makeStyles = (theme: Theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.palette.bg,
  },
  padded: {
    paddingHorizontal: 16,
  },
})
