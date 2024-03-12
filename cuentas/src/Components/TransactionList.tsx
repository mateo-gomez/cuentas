import { ScrollView, StyleSheet, View } from "react-native"
import { TransactionsAccordion } from "./TransactionsAccordion"
import { TransactionAggregate } from "../../types"

interface TransactionListProps {
  transactionsGrouped: TransactionAggregate[]
}

export const TransactionList = ({
  transactionsGrouped,
}: TransactionListProps) => {
  return (
    <View style={styles.container}>
      <ScrollView>
        {transactionsGrouped.map((group) => (
          <TransactionsAccordion
            key={group._id}
            title={group._id}
            balance={group.balance}
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
