import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import grafito from "../../theme"
import { useTransactions } from "../../hooks"
import { formatDate, formatNumber } from "../../utils"
import { memo } from "react"
import { TransactionAggregate, Transaction, TransactionType } from "../../../types"
import CategoryChip from "../../Components/CategoryChip"
import { useNavigate } from "react-router-native"

const SCREEN_WIDTH = Dimensions.get("screen").width

// ─── Hero balance card ────────────────────────────────────────────────────────

interface HeroCardProps {
  balance: number
  incomes: number
  expenses: number
}

const HeroCard = ({ balance, incomes, expenses }: HeroCardProps) => (
  <View style={hero.card}>
    <Text style={hero.eyebrow}>SALDO DEL MES</Text>
    <Text style={hero.balanceText}>${formatNumber(Math.abs(balance))}</Text>

    {/* Dashed divider */}
    <View style={hero.dividerRow}>
      {Array.from({ length: 24 }).map((_, i) => (
        <View key={i} style={hero.dash} />
      ))}
    </View>

    {/* Incomes / Expenses */}
    <View style={hero.row}>
      <View style={hero.col}>
        <Text style={hero.colLabel}>↑ Ingresos</Text>
        <Text style={[hero.colAmount, { color: grafito.pos }]}>${formatNumber(incomes)}</Text>
      </View>
      <View style={hero.separator} />
      <View style={hero.col}>
        <Text style={hero.colLabel}>↓ Gastos</Text>
        <Text style={[hero.colAmount, { color: grafito.neg }]}>${formatNumber(expenses)}</Text>
      </View>
    </View>
  </View>
)

const hero = StyleSheet.create({
  card: {
    backgroundColor: grafito.surface,
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
    paddingHorizontal: 20,
    paddingVertical: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  eyebrow: {
    fontFamily: "Courier New",
    fontSize: 11,
    letterSpacing: 0.8,
    color: grafito.ink4,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  balanceText: {
    fontFamily: "Georgia",
    fontSize: 48,
    color: grafito.ink,
    lineHeight: 54,
    marginBottom: 14,
  },
  dividerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  dash: {
    width: 6,
    height: 1,
    backgroundColor: grafito.line,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  col: {
    flex: 1,
    alignItems: "center",
  },
  separator: {
    width: 1,
    height: 32,
    backgroundColor: grafito.line,
  },
  colLabel: {
    fontFamily: "System",
    fontSize: 11,
    color: grafito.ink4,
    marginBottom: 2,
  },
  colAmount: {
    fontFamily: "Georgia",
    fontSize: 18,
    color: grafito.ink,
  },
})

// ─── Daily group ─────────────────────────────────────────────────────────────

interface DayGroupProps {
  group: TransactionAggregate
}

const DayGroup = ({ group }: DayGroupProps) => {
  const dayTotal = group.balance.balance
  const dayLabel = formatDate(new Date(group.minDate), {
    weekday: "short",
    day: "2-digit",
    month: "short",
  }).toUpperCase()

  return (
    <View style={day.container}>
      {/* Day header */}
      <View style={day.header}>
        <Text style={day.dateLabel}>{dayLabel}</Text>
        <Text style={[day.dayTotal, { color: dayTotal >= 0 ? grafito.pos : grafito.neg }]}>
          {dayTotal >= 0 ? "+" : "-"}${formatNumber(Math.abs(dayTotal))}
        </Text>
      </View>

      {/* Transactions */}
      {group.transactions.map((tx) => (
        <TransactionRow key={tx._id} transaction={tx} />
      ))}
    </View>
  )
}

const day = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: grafito.line2,
    marginBottom: 2,
  },
  dateLabel: {
    fontFamily: "Courier New",
    fontSize: 11,
    letterSpacing: 0.5,
    color: grafito.ink4,
  },
  dayTotal: {
    fontFamily: "System",
    fontSize: 13,
    color: grafito.ink3,
  },
})

// ─── Transaction row ─────────────────────────────────────────────────────────

interface TransactionRowProps {
  transaction: Transaction
}

const TransactionRow = ({ transaction }: TransactionRowProps) => {
  const navigate = useNavigate()
  const isIncome = transaction.type === TransactionType.income
  const categoryId = transaction.category?._id ?? transaction.category?.name ?? "default"
  const categoryName = transaction.category?.name ?? "Sin categoría"
  const categoryIcon = transaction.category?.icon

  return (
    <TouchableOpacity
      style={row.container}
      onPress={() => navigate(`/transactions/${TransactionType[transaction.type]}/${transaction._id}`)}
      activeOpacity={0.7}
    >
      <CategoryChip
        categoryId={categoryId}
        name={categoryName}
        icon={categoryIcon}
        size="md"
      />
      <View style={row.info}>
        <Text style={row.categoryName} numberOfLines={1}>{categoryName}</Text>
        {transaction.description ? (
          <Text style={row.description} numberOfLines={1}>{transaction.description}</Text>
        ) : null}
      </View>
      <Text style={[row.amount, { color: isIncome ? grafito.pos : grafito.neg }]}>
        {isIncome ? "+" : "-"}${formatNumber(transaction.value)}
      </Text>
    </TouchableOpacity>
  )
}

const row = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: grafito.line2,
  },
  info: {
    flex: 1,
  },
  categoryName: {
    fontFamily: "System",
    fontSize: 14,
    color: grafito.ink2,
  },
  description: {
    fontFamily: "System",
    fontSize: 12,
    color: grafito.ink4,
    marginTop: 1,
  },
  amount: {
    fontFamily: "Georgia",
    fontSize: 15,
  },
})

// ─── Main component ───────────────────────────────────────────────────────────

const Transactions = ({ start, end }: { start: Date; end: Date }) => {
  const { transactions, loading, balance } = useTransactions({ start, end })

  return (
    <View style={{ flex: 1, width: SCREEN_WIDTH }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero card */}
        <HeroCard
          balance={balance.balance}
          incomes={balance.incomes}
          expenses={balance.expenses}
        />

        {/* Daily groups */}
        {loading && !transactions.length ? (
          <View style={empty.container}>
            <Text style={empty.text}>Cargando...</Text>
          </View>
        ) : !transactions.length ? (
          <View style={empty.container}>
            <Text style={empty.text}>No hay registros</Text>
          </View>
        ) : (
          transactions.map((group) => (
            <DayGroup key={group._id} group={group} />
          ))
        )}
      </ScrollView>
    </View>
  )
}

const empty = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 40,
  },
  text: {
    fontFamily: "System",
    fontSize: 14,
    color: grafito.ink4,
  },
})

export default memo(Transactions)
