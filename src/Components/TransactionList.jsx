import { FlatList, View } from "react-native"
import TransactionItem from "./TransactionItem"

const TransactionList = ({ cuentas }) => {
    return (
        <View>
            <FlatList
                data={cuentas}
                renderItem={({ item: cuenta }) => (
                    <TransactionItem {...cuenta} />
                )}
            />
        </View>
    )
}

export default TransactionList
