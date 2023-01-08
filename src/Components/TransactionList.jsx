import { FlatList, Text, View } from "react-native"
import TransactionItem from "./TransactionItem"

const TransactionList = ({ cuentas }) => {
    return (
        <View>
            <FlatList
                data={cuentas}
                ItemSeparatorComponent={<Text />}
                renderItem={({ item: cuenta }) => (
                    <TransactionItem {...cuenta} />
                )}
            />
        </View>
    )
}

export default TransactionList
