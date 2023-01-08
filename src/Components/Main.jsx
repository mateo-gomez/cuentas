import { StyleSheet, View } from "react-native"
import Transactions from "./Transactions"
import AppBar from "./AppBar"

const Main = () => {
    return (
        <View style={styles.container}>
            <AppBar />
            <Transactions />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
    },
})

export default Main
