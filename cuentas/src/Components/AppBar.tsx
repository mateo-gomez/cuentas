import { StyleProp, StyleSheet, View, ViewStyle } from "react-native"
import Constants from "expo-constants"
import { theme } from "../theme"
import { PropsWithChildren } from "react"

export const AppBar = ({
  children,
  style = {},
}: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) => {
  return (
    <View style={styles.container}>
      <View style={[{ marginTop: Constants.statusBarHeight }, [style]]}>
        {children}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
    backgroundColor: theme.appBar.primary,
    minHeight: 100,
    paddingHorizontal: 20,
  },
})
