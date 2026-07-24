import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { useState } from "react"
import { useNavigate } from "react-router"
import { Ionicons } from "@expo/vector-icons"
import { useTheme, useThemedStyles } from "../../../theme/index"
import type { Theme } from "../../../theme/index"
import { useAmount } from "../../../theme/useAmount"
import { formatNumber } from "../../../utils"
import { Transaction, TransactionType } from "../../../../types"
import CategoryChip from "../../../Components/CategoryChip"

const isWeb = Platform.OS === "web"

interface TransactionRowProps {
  transaction: Transaction
  selectionMode: boolean
  selected: boolean
  onToggleSelect: (id: string) => void
  onQuickDelete: (id: string) => void
}

export const TransactionRow = ({
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
  const isTransfer = !!transaction.isTransfer
  const categoryId =
    transaction.category?._id ?? transaction.category?.name ?? "default"
  const categoryName = transaction.category?.name ?? "Sin categoría"
  const categoryIcon = transaction.category?.icon

  const handlePress = () => {
    if (selectionMode) {
      onToggleSelect(transaction._id)
      return
    }
    // Transfers are two linked legs — editing one as a normal transaction would
    // desync the pair. Route them to the transfer editor, which rewrites both
    // legs at once. Derive from/to from THIS leg's role: the expenses leg is the
    // source, the income leg is the destination.
    if (transaction.isTransfer && transaction.transferId) {
      const isSource = transaction.type === TransactionType.expenses
      navigate(`/accounts/transfer/${transaction.transferId}`, {
        state: {
          fromId: isSource
            ? transaction.accountId
            : transaction.counterpartyAccountId,
          toId: isSource
            ? transaction.counterpartyAccountId
            : transaction.accountId,
          value: transaction.value,
          description: transaction.description,
          date: transaction.date,
        },
      })
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
        isTransfer && row.transferContainer,
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
        <View style={row.titleRow}>
          <Text style={row.categoryName} numberOfLines={1}>
            {categoryName}
          </Text>
          {isTransfer ? (
            <View style={row.transferBadge}>
              <Ionicons
                name="swap-horizontal"
                size={11}
                color={theme.palette.accent}
              />
              <Text style={row.transferBadgeText}>Transferencia</Text>
            </View>
          ) : null}
        </View>
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
    transferContainer: {
      borderLeftWidth: 3,
      borderLeftColor: theme.palette.accent,
      paddingLeft: 9,
    },
    selected: {
      backgroundColor: theme.palette.surface3,
    },
    titleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    transferBadge: {
      flexDirection: "row",
      alignItems: "center",
      flexShrink: 0,
      gap: 3,
      paddingHorizontal: 6,
      paddingVertical: 1,
      borderRadius: 6,
      backgroundColor: theme.palette.surface3,
    },
    transferBadgeText: {
      fontFamily: theme.weight.medium,
      fontSize: 10,
      color: theme.palette.accent,
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
      flexShrink: 1,
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
