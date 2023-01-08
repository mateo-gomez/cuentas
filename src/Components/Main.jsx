import { StyleSheet, View } from "react-native"
import Constants from "expo-constants"
import Transactions from "./Transactions"

const Main = () => {
    return (
        <View style={styles.container}>
            <Transactions />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginTop: Constants.statusBarHeight,
        flexGrow: 1,
    },
})

export default Main
