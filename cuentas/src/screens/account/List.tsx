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
import grafito from "../../theme"
import { useAccounts, useTabBar } from "../../hooks"
import BottomTabBar from "../../Components/BottomTabBar"
import { Account } from "../../../types"
import { formatNumber } from "../../utils"
import { balanceColor } from "../../utils/amountColor"

const AccountRow = ({ account }: { account: Account }) => {
  const navigate = useNavigate()

  return (
    <TouchableOpacity
      style={styles.row}
      onPress={() => navigate(`/accounts/${account._id}`)}
    >
      <View style={styles.rowIcon}>
        <Ionicons
          name={account.type === "credit" ? "card-outline" : "wallet-outline"}
          size={20}
          color={grafito.accent}
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
      <Text
        style={[
          styles.rowBalance,
          { color: balanceColor(account.openingBalance) },
        ]}
      >
        {account.openingBalance < 0 ? "−" : ""}$
        {formatNumber(Math.abs(account.openingBalance))}
      </Text>
      <Ionicons name="chevron-forward" size={18} color={grafito.ink4} />
    </TouchableOpacity>
  )
}

const AccountsList = () => {
  const navigate = useNavigate()
  const insets = useSafeAreaInsets()
  const { accounts, loading, error } = useAccounts()
  const tabBar = useTabBar()

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigate(-1)}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="chevron-back" size={26} color={grafito.ink} />
        </TouchableOpacity>
        <Text style={styles.title}>Cuentas</Text>
        <TouchableOpacity
          onPress={() => navigate("/accounts/create")}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="add" size={26} color={grafito.ink} />
        </TouchableOpacity>
      </View>

      {accounts.length >= 2 ? (
        <TouchableOpacity
          style={styles.transferPill}
          onPress={() => navigate("/accounts/transfer")}
          accessibilityRole="button"
          accessibilityLabel="Transferir entre cuentas"
        >
          <Ionicons name="swap-vertical" size={16} color={grafito.accent} />
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
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: grafito.bg,
  },
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
    fontFamily: grafito.fonts.serif,
    fontSize: 20,
    color: grafito.ink,
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
    borderColor: grafito.line,
    backgroundColor: grafito.surface,
  },
  transferPillText: {
    fontFamily: grafito.fonts.sans,
    fontSize: 14,
    fontWeight: "600",
    color: grafito.accent,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  message: {
    fontFamily: grafito.fonts.sans,
    fontSize: 14,
    color: grafito.ink3,
    textAlign: "center",
    marginTop: 20,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: grafito.line2,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: grafito.surface3,
    alignItems: "center",
    justifyContent: "center",
  },
  rowInfo: {
    flex: 1,
  },
  rowName: {
    fontFamily: grafito.fonts.sans,
    fontSize: 15,
    color: grafito.ink,
  },
  rowType: {
    fontFamily: grafito.fonts.sans,
    fontSize: 12,
    color: grafito.ink4,
    marginTop: 1,
  },
  rowBalance: {
    fontFamily: grafito.amountFamily,
    ...grafito.numeric,
    fontSize: 15,
    color: grafito.ink,
  },
})

export default AccountsList
