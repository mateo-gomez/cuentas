import { useMemo } from "react"
import { ScrollView, Text, TouchableOpacity, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useNavigate } from "react-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useTheme, useThemedStyles, useAmount, chipColors } from "../../theme/index"
import type { CategoryTones, Theme, ThemePref } from "../../theme/index"
import { formatNumber } from "../../utils"

// Real Claro/Oscuro/Auto theme picker. The sample cards below render a live
// preview of the actually active theme via useTheme() — the footnote
// "se aplica a toda la app" is literally true because selecting persists
// and repaints globally.

type Kind = "income" | "expense"

const modes: { id: ThemePref; name: string; hint: string }[] = [
  { id: "claro", name: "Claro", hint: "Fondo claro, siempre activo" },
  { id: "oscuro", name: "Oscuro", hint: "Fondo oscuro, siempre activo" },
  { id: "sepia", name: "Sepia", hint: "Papel cálido, siempre activo" },
  { id: "indigo", name: "Índigo", hint: "Oscuro índigo, siempre activo" },
  { id: "auto", name: "Auto", hint: "Sigue el tema del sistema operativo" },
]

const tones = (categoryTones: CategoryTones) =>
  Object.keys(categoryTones) as Array<keyof CategoryTones>

function getTone(categoryTones: CategoryTones, id: string) {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) & 0xffffff
  const keys = tones(categoryTones)
  return categoryTones[keys[hash % keys.length]]
}

const sampleRows: {
  name: string
  category: string
  icon: string
  value: number
  kind: Kind
}[] = [
  { name: "Mercado", category: "Supermercado", icon: "cart-outline", value: 45000, kind: "expense" },
  { name: "Sueldo", category: "Ingresos", icon: "cash-outline", value: 1200000, kind: "income" },
  { name: "Netflix", category: "Suscripciones", icon: "tv-outline", value: 18900, kind: "expense" },
  { name: "Freelance", category: "Ingresos", icon: "laptop-outline", value: 340000, kind: "income" },
  { name: "Transporte", category: "Movilidad", icon: "bus-outline", value: 7500, kind: "expense" },
]

const incomes = 1540000
const expenses = 71400
const balance = incomes - expenses

const money = (value: number) => `$${formatNumber(Math.abs(value))}`

const ThemePreview = () => {
  const navigate = useNavigate()
  const insets = useSafeAreaInsets()
  const { theme, pref, setPref } = useTheme()
  const { amountColor, balanceColor } = useAmount()
  const styles = useThemedStyles(makeStyles)

  const chipStyle = useMemo(
    () => (categoryId: string) => chipColors(theme, getTone(theme.categoryTones, categoryId)),
    [theme],
  )

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigate(-1)} hitSlop={8} accessibilityLabel="Volver">
          <Ionicons name="chevron-back" size={24} color={theme.palette.ink} />
        </TouchableOpacity>
        <Text style={styles.title}>Tema</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Theme mode */}
        <Text style={styles.sectionLabel}>TEMA</Text>
        <View style={styles.chipRow}>
          {modes.map((m) => {
            const active = m.id === pref
            return (
              <TouchableOpacity
                key={m.id}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setPref(m.id)}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{m.name}</Text>
              </TouchableOpacity>
            )
          })}
        </View>
        <Text style={styles.hint}>{modes.find((m) => m.id === pref)?.hint}</Text>

        {/* Hero balance card */}
        <View style={styles.card}>
          <Text style={styles.eyebrow}>SALDO DEL MES</Text>
          <Text style={[styles.balance, { color: theme.palette.ink }]}>{money(balance)}</Text>
          <View style={styles.divider} />
          <View style={styles.heroRow}>
            <View style={styles.heroCol}>
              <Text style={styles.heroLabel}>↑ Ingresos</Text>
              <Text style={[styles.heroAmount, { color: amountColor("income") }]}>{money(incomes)}</Text>
            </View>
            <View style={styles.heroSep} />
            <View style={styles.heroCol}>
              <Text style={styles.heroLabel}>↓ Gastos</Text>
              <Text style={[styles.heroAmount, { color: amountColor("expense") }]}>{money(expenses)}</Text>
            </View>
          </View>
        </View>

        {/* Transaction list */}
        <View style={styles.card}>
          {sampleRows.map((row, i) => {
            const c = chipStyle(row.name)
            return (
              <View key={row.name} style={[styles.txRow, i < sampleRows.length - 1 && styles.txBorder]}>
                <View style={[styles.chipIcon, { backgroundColor: c.bg }]}>
                  <Ionicons name={row.icon as any} size={18} color={c.fg} />
                </View>
                <View style={styles.txInfo}>
                  <Text style={styles.txName}>{row.name}</Text>
                  <Text style={styles.txCategory}>{row.category}</Text>
                </View>
                <Text style={[styles.txAmount, { color: amountColor(row.kind) }]}>
                  {row.kind === "income" ? "+" : "−"}
                  {money(row.value)}
                </Text>
              </View>
            )
          })}
        </View>

        {/* Negative states — where the theme's negative color applies */}
        <View style={styles.card}>
          <View style={[styles.txRow, styles.txBorder]}>
            <View style={styles.txInfo}>
              <Text style={styles.txName}>Tarjeta de crédito</Text>
              <Text style={styles.txCategory}>Saldo negativo</Text>
            </View>
            <Text style={[styles.txAmount, { color: balanceColor(-230000) }]}>−{money(230000)}</Text>
          </View>
          <View style={styles.txRow}>
            <View style={styles.txInfo}>
              <Text style={styles.txName}>Restaurantes</Text>
              <Text style={styles.txCategory}>Sobregiro de presupuesto</Text>
            </View>
            <Text style={[styles.txAmount, { color: balanceColor(-15000) }]}>−{money(15000)}</Text>
          </View>
        </View>

        <Text style={styles.footnote}>Cuando elijas, se aplica a toda la app.</Text>
      </ScrollView>
    </View>
  )
}

const makeStyles = (theme: Theme) => ({
  screen: {
    flex: 1,
    backgroundColor: theme.palette.bg,
  },
  header: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  title: {
    fontFamily: theme.weight.semibold,
    fontSize: 20,
    color: theme.palette.ink,
  },
  sectionLabel: {
    fontFamily: theme.weight.medium,
    fontSize: 11,
    letterSpacing: 0.8,
    color: theme.palette.ink4,
    marginHorizontal: 20,
    marginTop: 18,
    marginBottom: 10,
  },
  chipRow: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 8,
    paddingHorizontal: 20,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.palette.line,
    backgroundColor: theme.palette.surface,
  },
  chipActive: {
    backgroundColor: theme.palette.accent,
    borderColor: theme.palette.accent,
  },
  chipText: {
    fontFamily: theme.weight.medium,
    fontSize: 14,
    color: theme.palette.ink2,
  },
  chipTextActive: {
    color: theme.palette.onAccent,
  },
  hint: {
    fontFamily: theme.fonts.sans,
    fontSize: 12,
    color: theme.palette.ink3,
    marginHorizontal: 20,
    marginTop: 10,
  },
  card: {
    backgroundColor: theme.palette.surface,
    borderRadius: 18,
    marginHorizontal: 20,
    marginTop: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: theme.palette.line,
  },
  eyebrow: {
    fontFamily: theme.weight.medium,
    fontSize: 11,
    letterSpacing: 0.8,
    color: theme.palette.ink4,
    textTransform: "uppercase" as const,
    marginBottom: 4,
  },
  balance: {
    fontFamily: theme.amountFamily,
    ...theme.numeric,
    fontSize: 40,
    lineHeight: 46,
    marginBottom: 14,
  },
  divider: {
    height: 1,
    backgroundColor: theme.palette.line2,
    marginBottom: 14,
  },
  heroRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  heroCol: {
    flex: 1,
    alignItems: "center" as const,
  },
  heroSep: {
    width: 1,
    height: 32,
    backgroundColor: theme.palette.line,
  },
  heroLabel: {
    fontFamily: theme.fonts.sans,
    fontSize: 11,
    color: theme.palette.ink4,
    marginBottom: 2,
  },
  heroAmount: {
    fontFamily: theme.amountFamily,
    ...theme.numeric,
    fontSize: 18,
  },
  txRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    paddingVertical: 12,
  },
  txBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.palette.line2,
  },
  chipIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  txInfo: {
    flex: 1,
  },
  txName: {
    fontFamily: theme.weight.medium,
    fontSize: 14,
    color: theme.palette.ink2,
  },
  txCategory: {
    fontFamily: theme.fonts.sans,
    fontSize: 12,
    color: theme.palette.ink4,
    marginTop: 1,
  },
  txAmount: {
    fontFamily: theme.amountFamily,
    ...theme.numeric,
    fontSize: 15,
  },
  footnote: {
    fontFamily: theme.fonts.sans,
    fontSize: 12,
    color: theme.palette.ink4,
    textAlign: "center" as const,
    marginTop: 20,
    marginHorizontal: 24,
  },
})

export default ThemePreview
