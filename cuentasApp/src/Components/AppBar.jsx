import StyledText from "./StyledText"
import { StyleSheet, View } from "react-native"
import Constants from "expo-constants"
import { theme } from "../theme"
import BackButton from "./BackButton"

const AppBar = ({ backButton = false, title = "" }) => {
    return (
        <View style={styles.container}>
            {backButton && <BackButton style={styles.backButton} />}

            <StyledText
                style={styles.title}
                color={theme.colors.white}
                fontWeight="bold"
            >
                {title}
            </StyledText>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: theme.appBar.primary,
        marginTop: Constants.statusBarHeight,
        padding: 20,
    },
    title: {
        color: theme.appBar.textPrimary,
        textTransform: "capitalize",
    },
    backButton: {
        marginRight: 30,
    },
})

export default AppBar
