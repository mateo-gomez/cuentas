import { StyleSheet, View } from "react-native"
import Transactions from "./Transactions"
import AppBar from "./AppBar"
import { Route, Routes } from "react-router-native"
import AddTransaction from "./AddTransaction"

const Main = () => {
    return (
        <View style={styles.container}>
            <AppBar />
            <Routes>
                <Route path="/" element={<Transactions />} />
                <Route path="/transactions/add" element={<AddTransaction />} />
            </Routes>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexGrow: 1,
    },
})

export default Main
