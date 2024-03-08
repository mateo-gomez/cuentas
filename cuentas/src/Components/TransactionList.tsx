import { ScrollView, StyleSheet, View } from "react-native"
import { TransactionsAccordion } from "./TransactionsAccordion"
import { TransactionAggregate } from "../../types/transaction"

export interface TransactionListProps {
  transactionsGrouped: TransactionAggregate[]
}

const TransactionList = ({ transactionsGrouped }: TransactionListProps) => {
  return (
    <View style={styles.container}>
      <ScrollView>
        {transactionsGrouped.map((group) => (
          <TransactionsAccordion
            key={group._id}
            title={group._id}
            totals={group.balance}
            transactions={group.transactions}
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
