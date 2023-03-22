import { StyleSheet, View } from "react-native"
import { Route, Routes } from "react-router-native"
import AddTransaction from "../Pages/AddTransaction"
import CategoriesList from "../Pages/CategoriesList"
import NumPad from "../Pages/NumPad"
import Transactions from "../Pages/Transactions"

const Main = () => {
    return (
        <View style={styles.container}>
            <Routes>
                <Route path="/" element={<Transactions />} />
                <Route path="/transactions/:type" element={<AddTransaction />}>
                    <Route index element={<NumPad />} />
                    <Route path="categories" element={<CategoriesList />} />
                </Route>
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
