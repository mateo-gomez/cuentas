import { ScrollView, StyleSheet, View } from "react-native"
import { groupTransactions } from "../utils"
import { TransactionsAccordion } from "./TransactionsAccordion"

const TransactionList = ({ transactions }) => {
    const data = groupTransactions(transactions, "date")

    return (
        <View style={styles.container}>
            <ScrollView>
                {data.map((group) => (
                    <TransactionsAccordion
                        key={group.title}
                        title={group.title}
                        transactions={group.data}
                    />
                ))}
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 10,
    },
})

export default TransactionList
