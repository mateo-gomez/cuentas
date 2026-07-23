import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { memo, useCallback, useState } from "react"
import { Ionicons } from "@expo/vector-icons"
import { useTheme, useThemedStyles } from "../../theme/index"
import type { Theme } from "../../theme/index"
import { useWebScrollbar, scrollbarProps } from "../../theme/useWebScrollbar"
import { useTransactions } from "../../hooks"
import { useConfirm } from "../../contexts/ConfirmContext"
import { notify } from "../../utils/notify"
import { CategoryPickerModal } from "../../Components/CategoryPickerModal"
import { useCategories } from "../../hooks/useCategories"
import { HeroCard } from "./components/HeroCard"
import { DayGroup } from "./components/DayGroup"
import { EmptyState } from "../../Components"

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
          <EmptyState message="Cargando..." />
        ) : !transactions.length ? (
          <EmptyState message="No hay registros" />
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

export default memo(Transactions)
