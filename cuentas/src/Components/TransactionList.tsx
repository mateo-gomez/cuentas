import { ScrollView, StyleSheet, View } from "react-native"
import { TransactionsAccordion } from "./TransactionsAccordion"
import { TransactionAggregate } from "../../types"
import { formatDate, monthYearFormatter } from "../utils"

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
            title={monthYearFormatter(group.minDate)}
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
