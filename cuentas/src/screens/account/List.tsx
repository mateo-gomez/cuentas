import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useNavigate } from "react-router"
import { Screen, AmountText } from "../../Components"
import { useTheme, useThemedStyles } from "../../theme/index"
import type { Theme } from "../../theme/index"
import { useAmount } from "../../theme/useAmount"
import { useAccounts, useTabBar } from "../../hooks"
import BottomTabBar from "../../Components/BottomTabBar"
import { Account } from "../../../types"

const AccountRow = ({ account }: { account: Account }) => {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const styles = useThemedStyles(makeStyles)
  const { balanceColor } = useAmount()

  return (
    <TouchableOpacity
      style={styles.row}
      onPress={() => navigate(`/accounts/${account._id}`)}
    >
      <View style={styles.rowIcon}>
        <Ionicons
          name={account.type === "credit" ? "card-outline" : "wallet-outline"}
          size={20}
          color={theme.palette.accent}
        />
      </View>
      <View style={styles.rowInfo}>
        <Text style={styles.rowName} numberOfLines={1}>
          {account.name}
        </Text>
        <Text style={styles.rowType}>
          {account.type === "credit" ? "Tarjeta de crédito" : "Cuenta bancaria"}
        </Text>
      </View>
      <AmountText
        value={account.openingBalance}
        prefix={`${account.openingBalance < 0 ? "−" : ""}$`}
        style={[
          styles.rowBalance,
          { color: balanceColor(account.openingBalance) },
        ]}
      />
      <Ionicons name="chevron-forward" size={18} color={theme.palette.ink4} />
    </TouchableOpacity>
  )
}

const AccountsList = () => {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const styles = useThemedStyles(makeStyles)
  const insets = useSafeAreaInsets()
  const { accounts, loading, error } = useAccounts()
  const tabBar = useTabBar()

  return (
    <Screen style={{ paddingTop: insets.top }}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigate(-1)}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="chevron-back" size={26} color={theme.palette.ink} />
        </TouchableOpacity>
        <Text style={styles.title}>Cuentas</Text>
        <TouchableOpacity
          onPress={() => navigate("/accounts/create")}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="add" size={26} color={theme.palette.ink} />
        </TouchableOpacity>
      </View>

      {accounts.length >= 2 ? (
        <TouchableOpacity
          style={styles.transferPill}
          onPress={() => navigate("/accounts/transfer")}
          accessibilityRole="button"
          accessibilityLabel="Transferir entre cuentas"
        >
          <Ionicons
            name="swap-vertical"
            size={16}
            color={theme.palette.accent}
          />
          <Text style={styles.transferPillText}>Transferir entre cuentas</Text>
        </TouchableOpacity>
      ) : null}

      {error ? (
        <Text style={styles.message}>
          Ha ocurrido un error al cargar las cuentas
        </Text>
      ) : null}

      {loading && !accounts.length ? (
        <Text style={styles.message}>Cargando...</Text>
      ) : (
        <FlatList
          data={accounts}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.message}>No tenés cuentas todavía</Text>
          }
          renderItem={({ item }) => <AccountRow account={item} />}
        />
      )}

      <BottomTabBar {...tabBar} />
    </Screen>
  )
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 8,
      gap: 12,
    },
    title: {
      flex: 1,
      textAlign: "center",
      fontFamily: theme.fonts.serif,
      fontSize: 20,
      color: theme.palette.ink,
    },
    transferPill: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      marginHorizontal: 20,
      marginBottom: 12,
      paddingVertical: 11,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.palette.line,
      backgroundColor: theme.palette.surface,
    },
    transferPillText: {
      fontFamily: theme.fonts.sans,
      fontSize: 14,
      fontWeight: "600",
      color: theme.palette.accent,
    },
    list: {
      paddingHorizontal: 20,
      paddingBottom: 20,
    },
    message: {
      fontFamily: theme.fonts.sans,
      fontSize: 14,
      color: theme.palette.ink3,
      textAlign: "center",
      marginTop: 20,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.palette.line2,
    },
    rowIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.palette.surface3,
      alignItems: "center",
      justifyContent: "center",
    },
    rowInfo: {
      flex: 1,
    },
    rowName: {
      fontFamily: theme.fonts.sans,
      fontSize: 15,
      color: theme.palette.ink,
    },
    rowType: {
      fontFamily: theme.fonts.sans,
      fontSize: 12,
      color: theme.palette.ink4,
      marginTop: 1,
    },
    rowBalance: {
      fontFamily: theme.amountFamily,
      ...theme.numeric,
      fontSize: 15,
      color: theme.palette.ink,
    },
  })

export default AccountsList
