import { Dimensions, StyleSheet, View } from "react-native"
import { theme } from "../../theme"
import { StyledText, NumberFormat, TransactionList } from "../../Components"
import { useTransactions } from "../../hooks"
import { formatDate } from "../../utils"
import { memo } from "react"

const Transactions = ({ start, end }: { start: Date; end: Date }) => {
  const { transactions, loading, balance } = useTransactions({ start, end })

  return (
    <View style={{ flex: 1, width: Dimensions.get("screen").width }}>
      <View
        style={{
          paddingVertical: 10,
          backgroundColor: theme.colors.greenLight,
        }}
      >
        <StyledText textCenter fontSize="small" color="white">
          {formatDate(start)}
        </StyledText>
      </View>

      <View style={styles.balanceContainer}>
        <View style={styles.balance}>
          <StyledText fontSize="subheading" fontWeight={theme.fontWeights.bold}>
            Saldo:{" "}
          </StyledText>
          <NumberFormat fontSize="subheading" value={balance.balance} />
        </View>
      </View>

      <View style={styles.list}>
        {!transactions.length ? (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            {loading ? (
              <StyledText>Cargando...</StyledText>
            ) : (
              <StyledText>No hay registros</StyledText>
            )}
          </View>
        ) : (
          <TransactionList transactionsGrouped={transactions} />
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  center: {
    alignItems: "center",
  },
  balance: {
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  balanceContainer: {
    padding: 10,
  },
  list: {
    marginBottom: 10,
    flex: 1,
  },
})

export default memo(Transactions)
