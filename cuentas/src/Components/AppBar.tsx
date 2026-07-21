import { StyleProp, View, ViewStyle } from "react-native"
import Constants from "expo-constants"
import { useTheme, useThemedStyles } from "../theme/index"
import type { Theme } from "../theme/index"
import { PropsWithChildren } from "react"

export const AppBar = ({
  children,
  style = {},
}: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) => {
  const styles = useThemedStyles(makeStyles)
  return (
    <View style={styles.container}>
      <View style={[{ marginTop: Constants.statusBarHeight }, [style]]}>
        {children}
      </View>
    </View>
  )
}

const makeStyles = (theme: Theme) => ({
  container: {
    flexDirection: "row" as const,
    width: "100%" as const,
    alignItems: "center" as const,
    backgroundColor: theme.palette.accent,
    minHeight: 100,
    paddingHorizontal: 20,
  },
})
