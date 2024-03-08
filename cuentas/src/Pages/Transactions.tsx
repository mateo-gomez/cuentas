import {
  DrawerLayoutAndroid,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native"
import { useNavigate } from "react-router-native"
import { theme } from "../theme"
import { useEffect, useRef, useState } from "react"
import { Ionicons } from "@expo/vector-icons"

import {
  AppBar,
  StyledText,
  OptionsSideBar,
  NumberFormat,
  TransactionList,
} from "../Components"
import { getTransactions } from "../services"

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
    getTransactions()
      .then(({ transactions, totals }) => {
        setTotals(totals)
        setTransactions(transactions)
      })
      .catch((error) => {
        console.log(error.message)
      })
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
            <Ionicons
              name="remove-circle-outline"
              color={theme.colors.red}
              size={120}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={handlePressPlusButton}>
            <Ionicons
              name="add-circle-outline"
              color={theme.colors.greenLight}
              size={120}
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
