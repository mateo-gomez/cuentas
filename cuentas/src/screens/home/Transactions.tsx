import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import grafito from "../../theme"
import { useTransactions } from "../../hooks"
import { useConfirm } from "../../contexts/ConfirmContext"
import { notify } from "../../utils/notify"
import { formatDate, formatNumber } from "../../utils"
import { memo, useCallback, useState } from "react"
import {
  TransactionAggregate,
  Transaction,
  TransactionType,
} from "../../../types"
import CategoryChip from "../../Components/CategoryChip"
import { useNavigate } from "react-router"
import { Ionicons } from "@expo/vector-icons"

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
    <Text
      style={[
        hero.balanceText,
        { color: balance < 0 ? grafito.neg : grafito.ink },
      ]}
    >
      {balance < 0 ? "-" : ""}${formatNumber(Math.abs(balance))}
    </Text>

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
        <Text style={[hero.colAmount, { color: grafito.pos }]}>
          ${formatNumber(incomes)}
        </Text>
      </View>
      <View style={hero.separator} />
      <View style={hero.col}>
        <Text style={hero.colLabel}>↓ Gastos</Text>
        <Text style={[hero.colAmount, { color: grafito.neg }]}>
          ${formatNumber(expenses)}
        </Text>
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
  selectionMode: boolean
  selectedIds: Set<string>
  onToggleSelect: (id: string) => void
}

const DayGroup = ({
  group,
  selectionMode,
  selectedIds,
  onToggleSelect,
}: DayGroupProps) => {
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
        <Text
          style={[
            day.dayTotal,
            { color: dayTotal >= 0 ? grafito.pos : grafito.neg },
          ]}
        >
          {dayTotal >= 0 ? "+" : "-"}${formatNumber(Math.abs(dayTotal))}
        </Text>
      </View>

      {/* Transactions */}
      {group.transactions.map((tx) => (
        <TransactionRow
          key={tx._id}
          transaction={tx}
          selectionMode={selectionMode}
          selected={selectedIds.has(tx._id)}
          onToggleSelect={onToggleSelect}
        />
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
  selectionMode: boolean
  selected: boolean
  onToggleSelect: (id: string) => void
}

const TransactionRow = ({
  transaction,
  selectionMode,
  selected,
  onToggleSelect,
}: TransactionRowProps) => {
  const navigate = useNavigate()
  const isIncome = transaction.type === TransactionType.income
  const categoryId =
    transaction.category?._id ?? transaction.category?.name ?? "default"
  const categoryName = transaction.category?.name ?? "Sin categoría"
  const categoryIcon = transaction.category?.icon

  const handlePress = () => {
    if (selectionMode) {
      onToggleSelect(transaction._id)
      return
    }
    navigate(
      `/transactions/${TransactionType[transaction.type]}/${transaction._id}`,
    )
  }

  return (
    <TouchableOpacity
      style={[row.container, selected && row.selected]}
      onPress={handlePress}
      onLongPress={() => onToggleSelect(transaction._id)}
      delayLongPress={250}
      activeOpacity={0.7}
    >
      {selectionMode ? (
        <Ionicons
          name={selected ? "checkmark-circle" : "ellipse-outline"}
          size={24}
          color={selected ? grafito.pos : grafito.ink4}
        />
      ) : (
        <CategoryChip
          categoryId={categoryId}
          name={categoryName}
          icon={categoryIcon}
          size="md"
        />
      )}
      <View style={row.info}>
        <Text style={row.categoryName} numberOfLines={1}>
          {categoryName}
        </Text>
        {transaction.description ? (
          <Text style={row.description} numberOfLines={1}>
            {transaction.description}
          </Text>
        ) : null}
      </View>
      <Text
        style={[row.amount, { color: isIncome ? grafito.pos : grafito.neg }]}
      >
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
  selected: {
    backgroundColor: grafito.surface3,
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

const Transactions = ({
  start,
  end,
  accountId,
}: {
  start: Date
  end: Date
  accountId?: string
}) => {
  const { transactions, loading, balance, removeTransactions } =
    useTransactions({
      start,
      end,
      accountId,
    })
  const confirm = useConfirm()
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [deleting, setDeleting] = useState(false)

  const selectionMode = selectedIds.size > 0

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const clearSelection = useCallback(() => setSelectedIds(new Set()), [])

  const runDelete = useCallback(async () => {
    const ids = [...selectedIds]
    setDeleting(true)
    try {
      await removeTransactions(ids)
      clearSelection()
    } catch {
      notify.error("Error", "No se pudieron eliminar las transacciones")
    } finally {
      setDeleting(false)
    }
  }, [selectedIds, removeTransactions, clearSelection])

  const confirmDelete = useCallback(async () => {
    const count = selectedIds.size
    const ok = await confirm({
      title: "Eliminar",
      message: `¿Eliminar ${count} ${
        count === 1 ? "transacción" : "transacciones"
      }?`,
      confirmText: "Eliminar",
      destructive: true,
    })
    if (ok) runDelete()
  }, [selectedIds, runDelete, confirm])

  return (
    <View style={{ flex: 1, width: SCREEN_WIDTH }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: selectionMode ? 80 : 16 }}
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
            <DayGroup
              key={group._id}
              group={group}
              selectionMode={selectionMode}
              selectedIds={selectedIds}
              onToggleSelect={toggleSelect}
            />
          ))
        )}
      </ScrollView>

      {/* Selection action bar */}
      {selectionMode ? (
        <View style={bar.container}>
          <TouchableOpacity
            style={bar.side}
            onPress={clearSelection}
            disabled={deleting}
          >
            <Ionicons name="close" size={22} color={grafito.ink3} />
            <Text style={bar.count}>{selectedIds.size}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={bar.deleteBtn}
            onPress={confirmDelete}
            disabled={deleting}
          >
            <Ionicons name="trash-outline" size={18} color="#fff" />
            <Text style={bar.deleteText}>
              {deleting ? "Eliminando..." : "Eliminar"}
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  )
}

const bar = StyleSheet.create({
  container: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: grafito.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  side: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  count: {
    fontFamily: "Georgia",
    fontSize: 16,
    color: grafito.ink,
  },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: grafito.neg,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  deleteText: {
    fontFamily: "System",
    fontSize: 14,
    color: "#fff",
    fontWeight: "600",
  },
})

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
