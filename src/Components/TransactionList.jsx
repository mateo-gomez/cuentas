import { FlatList, Text, View } from "react-native"
import CuentaItem from "./TransactionItem"

const TransactionList = ({ cuentas }) => {
    return (
        <View>
            <FlatList
                data={cuentas}
                ItemSeparatorComponent={<Text />}
                renderItem={({ item: cuenta }) => <CuentaItem {...cuenta} />}
            />
        </View>
    )
}

export default TransactionList
