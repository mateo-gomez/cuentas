import { useState } from "react"
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useNavigate } from "react-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import grafito from "../../theme"
import { formatNumber } from "../../utils"

// Preview-only playground for choosing how the transactions screen reads:
// number-colour scheme, category-icon treatment and the red used for negative
// state. The live app still reads its colours from theme.ts — this screen
// renders a realistic sample with local inline styles so the options can be
// compared before one is baked into the theme.

type Kind = "income" | "expense"

interface Scheme {
  id: string
  name: string
  hint: string
  expense: string
  income: string
}

const schemes: Scheme[] = [
  {
    id: "reserved",
    name: "Reservado",
    hint: "Gasto neutro · ingreso verde · rojo solo para negativos reales",
    expense: grafito.ink,
    income: grafito.pos,
  },
  {
    id: "mono",
    name: "Mono",
    hint: "Casi sin color · el signo +/− comunica",
    expense: grafito.ink,
    income: grafito.ink3,
  },
  {
    id: "dual",
    name: "Dual vivo",
    hint: "Clásico · gasto rojo · ingreso verde",
    expense: "#e5484d",
    income: "#0f9d6b",
  },
  {
    id: "accent",
    name: "Accent",
    hint: "Ingreso en teal de marca · gasto neutro",
    expense: grafito.ink,
    income: grafito.accent,
  },
]

// Category-icon treatments — the main lever for how "busy" the list feels.
const iconTreatments = [
  { id: "color", name: "Color", hint: "Pastilla pastel por categoría (actual)" },
  { id: "tint", name: "Ícono color", hint: "Base neutra, solo el ícono con color" },
  { id: "neutral", name: "Neutro", hint: "Todo monocromo, la lista más calma" },
] as const
type IconTreatment = (typeof iconTreatments)[number]["id"]

// Red used for genuinely negative state (negative balance, budget overspend).
const redHues = [
  { id: "terra", name: "Terracota", hex: "#c9483d" },
  { id: "classic", name: "Rojo", hex: "#e5484d" },
  { id: "carmin", name: "Carmín", hex: "#d1435b" },
  { id: "brick", name: "Teja", hex: "#b0463a" },
]

const tones = Object.keys(grafito.categoryTones) as Array<
  keyof typeof grafito.categoryTones
>
function getTone(id: string) {
  let hash = 0
  for (let i = 0; i < id.length; i++)
    hash = (hash * 31 + id.charCodeAt(i)) & 0xffffff
  return grafito.categoryTones[tones[hash % tones.length]]
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
  const [scheme, setScheme] = useState<Scheme>(schemes[0])
  const [iconStyle, setIconStyle] = useState<IconTreatment>("neutral")
  const [red, setRed] = useState(redHues[0])

  const amountColor = (kind: Kind) =>
    kind === "income" ? scheme.income : scheme.expense

  const chipColors = (categoryId: string) => {
    const tone = getTone(categoryId)
    if (iconStyle === "color") return { bg: tone.bg, fg: tone.fg }
    if (iconStyle === "tint") return { bg: grafito.surface3, fg: tone.fg }
    return { bg: grafito.surface3, fg: grafito.ink3 }
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigate(-1)}
          hitSlop={8}
          accessibilityLabel="Volver"
        >
          <Ionicons name="chevron-back" size={24} color={grafito.ink} />
        </TouchableOpacity>
        <Text style={styles.title}>Tema</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Number-colour scheme */}
        <Text style={styles.sectionLabel}>COLOR DE NÚMEROS</Text>
        <View style={styles.chipRow}>
          {schemes.map((s) => {
            const active = s.id === scheme.id
            return (
              <TouchableOpacity
                key={s.id}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setScheme(s)}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {s.name}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>
        <Text style={styles.hint}>{scheme.hint}</Text>

        {/* Icon treatment */}
        <Text style={styles.sectionLabel}>ÍCONOS DE CATEGORÍA</Text>
        <View style={styles.chipRow}>
          {iconTreatments.map((t) => {
            const active = t.id === iconStyle
            return (
              <TouchableOpacity
                key={t.id}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setIconStyle(t.id)}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {t.name}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>
        <Text style={styles.hint}>
          {iconTreatments.find((t) => t.id === iconStyle)?.hint}
        </Text>

        {/* Red hue */}
        <Text style={styles.sectionLabel}>ROJO (NEGATIVOS)</Text>
        <View style={styles.chipRow}>
          {redHues.map((h) => {
            const active = h.id === red.id
            return (
              <TouchableOpacity
                key={h.id}
                style={[styles.swatchChip, active && styles.chipActive]}
                onPress={() => setRed(h)}
              >
                <View style={[styles.swatch, { backgroundColor: h.hex }]} />
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {h.name}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>

        {/* Hero balance card */}
        <View style={styles.card}>
          <Text style={styles.eyebrow}>SALDO DEL MES</Text>
          <Text style={[styles.balance, { color: grafito.ink }]}>
            {money(balance)}
          </Text>
          <View style={styles.divider} />
          <View style={styles.heroRow}>
            <View style={styles.heroCol}>
              <Text style={styles.heroLabel}>↑ Ingresos</Text>
              <Text style={[styles.heroAmount, { color: scheme.income }]}>
                {money(incomes)}
              </Text>
            </View>
            <View style={styles.heroSep} />
            <View style={styles.heroCol}>
              <Text style={styles.heroLabel}>↓ Gastos</Text>
              <Text style={[styles.heroAmount, { color: grafito.ink }]}>
                {money(expenses)}
              </Text>
            </View>
          </View>
        </View>

        {/* Transaction list */}
        <View style={styles.card}>
          {sampleRows.map((row, i) => {
            const c = chipColors(row.name)
            return (
              <View
                key={row.name}
                style={[
                  styles.txRow,
                  i < sampleRows.length - 1 && styles.txBorder,
                ]}
              >
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

        {/* Negative states — where the red applies */}
        <View style={styles.card}>
          <View style={[styles.txRow, styles.txBorder]}>
            <View style={styles.txInfo}>
              <Text style={styles.txName}>Tarjeta de crédito</Text>
              <Text style={styles.txCategory}>Saldo negativo</Text>
            </View>
            <Text style={[styles.txAmount, { color: red.hex }]}>
              −{money(230000)}
            </Text>
          </View>
          <View style={styles.txRow}>
            <View style={styles.txInfo}>
              <Text style={styles.txName}>Restaurantes</Text>
              <Text style={styles.txCategory}>Sobregiro de presupuesto</Text>
            </View>
            <Text style={[styles.txAmount, { color: red.hex }]}>
              −{money(15000)}
            </Text>
          </View>
        </View>

        <Text style={styles.footnote}>
          Vista previa. Cuando elijas, se aplica a toda la app.
        </Text>
      </ScrollView>
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
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  title: {
    fontFamily: grafito.weight.semibold,
    fontSize: 20,
    color: grafito.ink,
  },
  sectionLabel: {
    fontFamily: grafito.weight.medium,
    fontSize: 11,
    letterSpacing: 0.8,
    color: grafito.ink4,
    marginHorizontal: 20,
    marginTop: 18,
    marginBottom: 10,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 20,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: grafito.line,
    backgroundColor: grafito.surface,
  },
  swatchChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: grafito.line,
    backgroundColor: grafito.surface,
  },
  swatch: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  chipActive: {
    backgroundColor: grafito.accent,
    borderColor: grafito.accent,
  },
  chipText: {
    fontFamily: grafito.weight.medium,
    fontSize: 14,
    color: grafito.ink2,
  },
  chipTextActive: {
    color: grafito.onAccent,
  },
  hint: {
    fontFamily: grafito.fonts.sans,
    fontSize: 12,
    color: grafito.ink3,
    marginHorizontal: 20,
    marginTop: 10,
  },
  card: {
    backgroundColor: grafito.surface,
    borderRadius: 18,
    marginHorizontal: 20,
    marginTop: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: grafito.line,
  },
  eyebrow: {
    fontFamily: grafito.weight.medium,
    fontSize: 11,
    letterSpacing: 0.8,
    color: grafito.ink4,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  balance: {
    fontFamily: grafito.amountFamily,
    ...grafito.numeric,
    fontSize: 40,
    lineHeight: 46,
    marginBottom: 14,
  },
  divider: {
    height: 1,
    backgroundColor: grafito.line2,
    marginBottom: 14,
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  heroCol: {
    flex: 1,
    alignItems: "center",
  },
  heroSep: {
    width: 1,
    height: 32,
    backgroundColor: grafito.line,
  },
  heroLabel: {
    fontFamily: grafito.fonts.sans,
    fontSize: 11,
    color: grafito.ink4,
    marginBottom: 2,
  },
  heroAmount: {
    fontFamily: grafito.amountFamily,
    ...grafito.numeric,
    fontSize: 18,
  },
  txRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
  },
  txBorder: {
    borderBottomWidth: 1,
    borderBottomColor: grafito.line2,
  },
  chipIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  txInfo: {
    flex: 1,
  },
  txName: {
    fontFamily: grafito.weight.medium,
    fontSize: 14,
    color: grafito.ink2,
  },
  txCategory: {
    fontFamily: grafito.fonts.sans,
    fontSize: 12,
    color: grafito.ink4,
    marginTop: 1,
  },
  txAmount: {
    fontFamily: grafito.amountFamily,
    ...grafito.numeric,
    fontSize: 15,
  },
  footnote: {
    fontFamily: grafito.fonts.sans,
    fontSize: 12,
    color: grafito.ink4,
    textAlign: "center",
    marginTop: 20,
    marginHorizontal: 24,
  },
})

export default ThemePreview
