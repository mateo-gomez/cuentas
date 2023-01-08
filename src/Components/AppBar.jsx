import StyledText from "./StyledText"
import { StyleSheet, View } from "react-native"
import Constants from "expo-constants"
import { theme } from "../theme"

const AppBar = () => {
    return (
        <View style={styles.container}>
            <StyledText style={styles.title} color="white" fontWeight="bold">
                Cuentas App
            </StyledText>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: theme.appBar.primary,
        marginTop: Constants.statusBarHeight,
        padding: 10,
    },
    title: {
        color: theme.appBar.textPrimary,
        textTransform: "uppercase",
    },
})

export default AppBar
