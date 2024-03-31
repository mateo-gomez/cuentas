import { StyleSheet, View } from "react-native"
import Constants from "expo-constants"
import { theme } from "../theme"

export const AppBar = ({ children, style = {} }) => {
  return (
    <View style={[styles.container, [style]]}>
      <View style={{ marginTop: Constants.statusBarHeight }}>{children}</View>
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
