import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { useTheme, useThemedStyles } from "../../theme/index"
import type { Theme } from "../../theme/index"
import { useAmount } from "../../theme/useAmount"
import { useWebScrollbar, scrollbarProps } from "../../theme/useWebScrollbar"
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
import { CategoryPickerModal } from "../../Components/CategoryPickerModal"
import { useCategories } from "../../hooks/useCategories"
import { useNavigate } from "react-router"
import { Ionicons } from "@expo/vector-icons"

const isWeb = Platform.OS === "web"

// ─── Hero balance card ────────────────────────────────────────────────────────

interface HeroCardProps {
  balance: number
  incomes: number
  expenses: number
}

const HeroCard = ({ balance, incomes, expenses }: HeroCardProps) => {
  const { theme } = useTheme()
  const hero = useThemedStyles(makeHero)
  const { balanceColor } = useAmount()

  return (
    <View style={hero.card}>
      <Text style={hero.eyebrow}>SALDO DEL MES</Text>
      <Text style={[hero.balanceText, { color: balanceColor(balance) }]}>
        {balance < 0 ? "−" : ""}${formatNumber(Math.abs(balance))}
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
          <Text style={[hero.colAmount, { color: theme.palette.pos }]}>
            ${formatNumber(incomes)}
          </Text>
        </View>
        <View style={hero.separator} />
        <View style={hero.col}>
          <Text style={hero.colLabel}>↓ Gastos</Text>
          <Text style={[hero.colAmount, { color: theme.palette.ink }]}>
            ${formatNumber(expenses)}
          </Text>
        </View>
      </View>
    </View>
  )
}

const makeHero = (theme: Theme) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.palette.surface,
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
      fontFamily: theme.weight.medium,
      fontSize: 11,
      letterSpacing: 0.8,
      color: theme.palette.ink4,
      textTransform: "uppercase",
      marginBottom: 4,
    },
    balanceText: {
      fontFamily: theme.amountFamily,
      ...theme.numeric,
      fontSize: 48,
      color: theme.palette.ink,
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
      backgroundColor: theme.palette.line,
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
      backgroundColor: theme.palette.line,
    },
    colLabel: {
      fontFamily: theme.fonts.sans,
      fontSize: 11,
      color: theme.palette.ink4,
      marginBottom: 2,
    },
    colAmount: {
      fontFamily: theme.amountFamily,
      ...theme.numeric,
      fontSize: 18,
      color: theme.palette.ink,
    },
  })

// ─── Daily group ─────────────────────────────────────────────────────────────

interface DayGroupProps {
  group: TransactionAggregate
  selectionMode: boolean
  selectedIds: Set<string>
  onToggleSelect: (id: string) => void
  onQuickDelete: (id: string) => void
}

const DayGroup = ({
  group,
  selectionMode,
  selectedIds,
  onToggleSelect,
  onQuickDelete,
}: DayGroupProps) => {
  const { theme } = useTheme()
  const day = useThemedStyles(makeDay)
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
            { color: dayTotal >= 0 ? theme.palette.pos : theme.palette.neg },
          ]}
        >
          {dayTotal >= 0 ? "+" : "−"}${formatNumber(Math.abs(dayTotal))}
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
          onQuickDelete={onQuickDelete}
        />
      ))}
    </View>
  )
}

const makeDay = (theme: Theme) =>
  StyleSheet.create({
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
      borderBottomColor: theme.palette.line2,
      marginBottom: 2,
    },
    dateLabel: {
      fontFamily: theme.weight.medium,
      fontSize: 11,
      letterSpacing: 0.5,
      color: theme.palette.ink4,
    },
    dayTotal: {
      fontFamily: theme.amountFamily,
      ...theme.numeric,
      fontSize: 13,
      color: theme.palette.ink3,
    },
  })

// ─── Transaction row ─────────────────────────────────────────────────────────

interface TransactionRowProps {
  transaction: Transaction
  selectionMode: boolean
  selected: boolean
  onToggleSelect: (id: string) => void
  onQuickDelete: (id: string) => void
}

const TransactionRow = ({
  transaction,
  selectionMode,
  selected,
  onToggleSelect,
  onQuickDelete,
}: TransactionRowProps) => {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const row = useThemedStyles(makeRow)
  const { amountColor, amountSign } = useAmount()
  const [hovered, setHovered] = useState(false)
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

  const showQuickDelete = isWeb && hovered && !selectionMode

  return (
    <Pressable
      style={({ pressed }) => [
        row.container,
        selected && row.selected,
        isWeb && hovered && row.hovered,
        pressed && { opacity: 0.7 },
      ]}
      onPress={handlePress}
      onLongPress={() => onToggleSelect(transaction._id)}
      delayLongPress={250}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
    >
      {selectionMode ? (
        <Ionicons
          name={selected ? "checkmark-circle" : "ellipse-outline"}
          size={24}
          color={selected ? theme.palette.pos : theme.palette.ink4}
        />
      ) : isWeb && hovered ? (
        // Web: hovering reveals a checkbox to start/extend a multi-selection
        <TouchableOpacity
          style={row.selectBox}
          onPress={() => onToggleSelect(transaction._id)}
          accessibilityLabel="Seleccionar transacción"
          hitSlop={8}
        >
          <Ionicons
            name="ellipse-outline"
            size={24}
            color={theme.palette.ink4}
          />
        </TouchableOpacity>
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
        style={[
          row.amount,
          { color: amountColor(isIncome ? "income" : "expense") },
        ]}
      >
        {amountSign(isIncome ? "income" : "expense")}$
        {formatNumber(transaction.value)}
      </Text>

      {/* Web-only quick-delete slot: reserved on web so it never shifts layout */}
      {isWeb && !selectionMode ? (
        <View style={row.action}>
          {showQuickDelete ? (
            <TouchableOpacity
              style={row.actionBtn}
              onPress={() => onQuickDelete(transaction._id)}
              accessibilityLabel="Eliminar transacción"
              hitSlop={8}
            >
              <Ionicons
                name="trash-outline"
                size={16}
                color={theme.palette.neg}
              />
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}
    </Pressable>
  )
}

const makeRow = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 10,
      gap: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.palette.line2,
    },
    selected: {
      backgroundColor: theme.palette.surface3,
    },
    hovered: {
      backgroundColor: theme.palette.surface3,
    },
    selectBox: {
      width: 40,
      height: 36,
      alignItems: "center",
      justifyContent: "center",
    },
    info: {
      flex: 1,
    },
    action: {
      width: 28,
      alignItems: "center",
      justifyContent: "center",
    },
    actionBtn: {
      width: 28,
      height: 28,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
    },
    categoryName: {
      fontFamily: theme.weight.medium,
      fontSize: 14,
      color: theme.palette.ink2,
    },
    description: {
      fontFamily: theme.fonts.sans,
      fontSize: 12,
      color: theme.palette.ink4,
      marginTop: 1,
    },
    amount: {
      fontFamily: theme.amountFamily,
      ...theme.numeric,
      fontSize: 15,
    },
  })

// ─── Main component ───────────────────────────────────────────────────────────

const Transactions = ({
  start,
  end,
  accountId,
  width,
  height,
}: {
  start: Date
  end: Date
  accountId?: string
  // Bounded on native (each page lives inside Home's horizontal pager). Omitted
  // on web, where Transactions renders as a top-level flex:1 scroller.
  width?: number
  height?: number
}) => {
  const { theme } = useTheme()
  const bar = useThemedStyles(makeBar)
  const empty = useThemedStyles(makeEmpty)
  const { transactions, loading, balance, removeTransactions, assignCategory } =
    useTransactions({
      start,
      end,
      accountId,
    })
  const confirm = useConfirm()
  const { categories } = useCategories()
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [deleting, setDeleting] = useState(false)
  const [categorizing, setCategorizing] = useState(false)
  const [pickerVisible, setPickerVisible] = useState(false)

  const selectionMode = selectedIds.size > 0
  const busy = deleting || categorizing

  useWebScrollbar()

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

  const quickDelete = useCallback(
    async (id: string) => {
      const ok = await confirm({
        title: "Eliminar",
        message: "¿Eliminar esta transacción?",
        confirmText: "Eliminar",
        destructive: true,
      })
      if (!ok) return
      try {
        await removeTransactions([id])
      } catch {
        notify.error("Error", "No se pudo eliminar la transacción")
      }
    },
    [confirm, removeTransactions],
  )

  const handlePickCategory = useCallback(
    async (categoryName: string) => {
      // CategoryPickerModal returns the category name; map it back to the id the
      // bulk endpoint expects.
      const category = categories.find((item) => item.name === categoryName)
      if (!category) return

      const ids = [...selectedIds]
      setCategorizing(true)
      try {
        await assignCategory(ids, category._id)
        clearSelection()
      } catch {
        notify.error("Error", "No se pudo asignar la categoría")
      } finally {
        setCategorizing(false)
      }
    },
    [categories, selectedIds, assignCategory, clearSelection],
  )

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
    // Native: bounded height/width because each page sits inside Home's
    // horizontal pager and a VirtualizedList item there doesn't resolve a flex
    // height. Web: no pager, so this is a plain top-level flex scroller.
    <View style={height != null ? { height, width } : { flex: 1 }}>
      <ScrollView
        style={height != null ? { height } : { flex: 1 }}
        contentContainerStyle={{ paddingBottom: selectionMode ? 80 : 16 }}
        {...scrollbarProps}
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
              onQuickDelete={quickDelete}
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
            disabled={busy}
          >
            <Ionicons name="close" size={22} color={theme.palette.ink3} />
            <Text style={bar.count}>{selectedIds.size}</Text>
          </TouchableOpacity>
          <View style={bar.actions}>
            <TouchableOpacity
              style={bar.categorizeBtn}
              onPress={() => setPickerVisible(true)}
              disabled={busy}
            >
              <Ionicons
                name="pricetag-outline"
                size={18}
                color={theme.palette.ink}
              />
              <Text style={bar.categorizeText}>
                {categorizing ? "Asignando..." : "Categorizar"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={bar.deleteBtn}
              onPress={confirmDelete}
              disabled={busy}
            >
              <Ionicons
                name="trash-outline"
                size={18}
                color={theme.palette.onAccent}
              />
              <Text style={bar.deleteText}>
                {deleting ? "Eliminando..." : "Eliminar"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      <CategoryPickerModal
        visible={pickerVisible}
        categories={categories}
        onSelect={handlePickCategory}
        onClose={() => setPickerVisible(false)}
      />
    </View>
  )
}

const makeBar = (theme: Theme) =>
  StyleSheet.create({
    container: {
      position: "absolute",
      left: 16,
      right: 16,
      bottom: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: theme.palette.surface,
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
      fontFamily: theme.weight.semibold,
      fontSize: 16,
      color: theme.palette.ink,
    },
    actions: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    categorizeBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: theme.palette.surface3,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    categorizeText: {
      fontFamily: theme.weight.semibold,
      fontSize: 14,
      color: theme.palette.ink,
    },
    deleteBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: theme.palette.neg,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    deleteText: {
      fontFamily: theme.weight.semibold,
      fontSize: 14,
      color: theme.palette.onAccent,
    },
  })

const makeEmpty = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingTop: 40,
    },
    text: {
      fontFamily: theme.fonts.sans,
      fontSize: 14,
      color: theme.palette.ink4,
    },
  })

export default memo(Transactions)
