import {
  DrawerLayoutAndroid,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native"
import StyledText from "../Components/StyledText"
import NumberFormat from "../Components/NumberFormat"
import TransactionList from "../Components/TransactionList"
import { useNavigate } from "react-router-native"
import { PlusCircle, MinusCircle } from "iconoir-react-native"
import { theme } from "../theme"
import AppBar from "../Components/AppBar"
import { useEffect, useRef, useState } from "react"
import OptionsSideBar from "../Components/OptionsSideBar"
import config from "../config"
import { TransactionAggregate } from "../../types/transaction"
import { Balance } from "../../types/balance"

interface TransactionResponse {
  transactions: TransactionAggregate[]
  totals: Balance
}

const Transactions = () => {
  const navigate = useNavigate()
  const drawerRef = useRef(null)
  const [summaryTransactions, setTransactions] = useState([])
  const [totals, setTotals] = useState({
    balance: 0,
    incomes: 0,
    expenses: 0,
  })

  useEffect(() => {
    const getTransactions = async () => {
      try {
        const response = await fetch(`${config.apiUrl}/transactions`)
        const { transactions, totals } =
          (await response.json()) as TransactionResponse

        const data = transactions.map((item) => {
          const transactions = item.transactions.map((transaction) => ({
            ...transaction,
            date: transaction.date,
          }))

          return {
            ...item,
            minDate: new Date(item.minDate),
            maxDate: new Date(item.maxDate),
            transactions,
          }
        })

        setTotals(totals)
        setTransactions(data)
      } catch (error) {
        console.log(error.message)
      }
    }

    getTransactions()
  }, [])

  const handlePressPlusButton = () => {
    navigate("/transactions/income")
  }

  const handlePressMinusButton = () => {
    navigate("/transactions/outcome")
  }

  return (
    <View style={{ flex: 1 }}>
      <AppBar>
        <StyledText color={"white"} fontWeight="bold">
          Cuentas App
        </StyledText>
      </AppBar>
      <DrawerLayoutAndroid
        ref={drawerRef}
        drawerPosition="right"
        drawerWidth={300}
        renderNavigationView={OptionsSideBar}
      >
        <View style={styles.balanceContainer}>
          <View style={styles.balance}>
            <StyledText
              fontSize="subheading"
              color="white"
              fontWeight={theme.fontWeights.bold}
            >
              Saldo:{" "}
            </StyledText>
            <NumberFormat
              color="white"
              fontSize="subheading"
              value={totals.balance}
            />
          </View>
        </View>

        <View style={styles.list}>
          <TransactionList transactionsGrouped={summaryTransactions} />
        </View>
        <View style={styles.buttons}>
          <TouchableOpacity onPress={handlePressMinusButton}>
            <MinusCircle color={theme.colors.red} width={120} height={120} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handlePressPlusButton}>
            <PlusCircle
              color={theme.colors.greenLight}
              width={120}
              height={120}
            />
          </TouchableOpacity>
        </View>
      </DrawerLayoutAndroid>
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
    color: theme.colors.textSecondary,
  },
  balanceContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.primary,
    backgroundColor: theme.colors.grey,
  },
  list: {
    marginBottom: 10,
    flex: 1,
  },
  buttons: {
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "space-around",
    flexDirection: "row",
  },
})

export default Transactions
