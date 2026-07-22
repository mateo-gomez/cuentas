import { StyleSheet, Text, View } from "react-native"
import { useTheme, useThemedStyles } from "../../../theme/index"
import type { Theme } from "../../../theme/index"
import { useAmount } from "../../../theme/useAmount"
import { formatNumber } from "../../../utils"

interface HeroCardProps {
  balance: number
  incomes: number
  expenses: number
}

// Monthly balance summary shown at the top of the transaction list.
export const HeroCard = ({ balance, incomes, expenses }: HeroCardProps) => {
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
