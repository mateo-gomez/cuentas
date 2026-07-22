import { StyleSheet, Text, View } from "react-native"
import { useTheme, useThemedStyles } from "../../../theme/index"
import type { Theme } from "../../../theme/index"
import { formatDate, formatNumber } from "../../../utils"
import { TransactionAggregate } from "../../../../types"
import { TransactionRow } from "./TransactionRow"

interface DayGroupProps {
  group: TransactionAggregate
  selectionMode: boolean
  selectedIds: Set<string>
  onToggleSelect: (id: string) => void
  onQuickDelete: (id: string) => void
}

// A single day's transactions with a header showing the date and day total.
export const DayGroup = ({
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
