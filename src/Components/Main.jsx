import { StyleSheet, View } from "react-native"
import { Route, Routes } from "react-router-native"
import Transactions from "../Pages/Transactions"
import AddTransaction from "../Pages/AddTransaction"

const Main = () => {
    return (
        <View style={styles.container}>
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
