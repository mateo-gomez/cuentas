import { ReactNode } from "react"
import { View, StyleProp, ViewStyle } from "react-native"
import { useTheme, useThemedStyles } from "../theme/index"
import type { Theme } from "../theme/index"
import { StyledText } from "./StyledText"
import { BackButton } from "./BackButton"

interface ScreenHeaderProps {
  title: string
  // true -> navigate(-1). A number navigates that many steps.
  back?: boolean | number
  actions?: ReactNode
  style?: StyleProp<ViewStyle>
}

// Standard screen header: optional back button, title, and right-aligned
// actions. Routes back navigation through the shared BackButton.
export const ScreenHeader = ({
  title,
  back,
  actions,
  style,
}: ScreenHeaderProps) => {
  const { theme } = useTheme()
  const styles = useThemedStyles(makeStyles)

  return (
    <View style={[styles.header, style]}>
      <View style={styles.left}>
        {back ? (
          <BackButton
            to={typeof back === "number" ? back : -1}
            color={theme.palette.ink}
          />
        ) : null}
        <StyledText style={styles.title}>{title}</StyledText>
      </View>
      {actions ? <View style={styles.actions}>{actions}</View> : null}
    </View>
  )
}

const makeStyles = (theme: Theme) => ({
  header: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingVertical: 12,
  },
  left: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 10,
    flexShrink: 1,
  },
  title: {
    fontFamily: theme.fonts.serif,
    fontSize: 20,
    color: theme.palette.ink,
  },
  actions: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
  },
})
