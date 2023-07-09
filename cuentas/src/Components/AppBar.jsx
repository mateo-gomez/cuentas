import { StyleSheet, View } from "react-native"
import Constants from "expo-constants"
import { theme } from "../theme"

const AppBar = ({ children, style = [] }) => {
    return <View style={[styles.container, [style]]}>{children}</View>
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: theme.appBar.primary,
        marginTop: Constants.statusBarHeight,
        padding: 20,
    },
})

export default AppBar