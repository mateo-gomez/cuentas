import React, { useMemo, useState } from "react"
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
} from "react-native"
import Svg, { Circle } from "react-native-svg"
import { Ionicons } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useNavigate } from "react-router"
import CategoryChip from "../../Components/CategoryChip"
import { useTheme, useThemedStyles } from "../../theme/index"
import type { Theme } from "../../theme/index"
import { Screen, AmountText } from "../../Components"
import { getTone } from "../../theme/iconTreatment"
import { useCategoryReport, useCategoryTrend } from "../../hooks"
import type { ReportSide } from "../../services"
import type { CategoryReportItem, CategoryTrendItem } from "../../../types"
import { formatNumber } from "../../utils"

const MONTHS_ES = [
  "ENERO",
  "FEBRERO",
  "MARZO",
  "ABRIL",
  "MAYO",
  "JUNIO",
  "JULIO",
  "AGOSTO",
  "SEPTIEMBRE",
  "OCTUBRE",
  "NOVIEMBRE",
  "DICIEMBRE",
]

// First/last instant of a given year+month, used as the report's range.
const monthBounds = (year: number, month: number) => ({
  start: new Date(year, month, 1),
  end: new Date(year, month + 1, 0, 23, 59, 59, 999),
})

// ─── Donut chart via SVG ──────────────────────────────────────────────────────
const CHART_SIZE = 200
const STROKE = 26

const DonutChart = ({
  items,
  colorFor,
  centerTop,
  centerBottom,
}: {
  items: CategoryReportItem[]
  colorFor: (item: CategoryReportItem) => string
  centerTop: string
  centerBottom: string
}) => {
  const { theme } = useTheme()
  const styles = useThemedStyles(makeStyles)
  const r = (CHART_SIZE - STROKE) / 2
  const c = CHART_SIZE / 2
  const circumference = 2 * Math.PI * r

  // Accumulate each segment's arc as a dash offset around the ring.
  let offset = 0
  const segments = items.map((item) => {
    const len = item.share * circumference
    const seg = { item, len, offset }
    offset += len
    return seg
  })

  return (
    <View style={styles.chartWrap}>
      <Svg
        width={CHART_SIZE}
        height={CHART_SIZE}
        style={{ transform: [{ rotate: "-90deg" }] }}
      >
        <Circle
          cx={c}
          cy={c}
          r={r}
          fill="none"
          stroke={theme.palette.line2}
          strokeWidth={STROKE}
        />
        {segments.map(({ item, len, offset: o }) => (
          <Circle
            key={item.categoryId}
            cx={c}
            cy={c}
            r={r}
            fill="none"
            stroke={colorFor(item)}
            strokeWidth={STROKE}
            strokeDasharray={`${len} ${circumference - len}`}
            strokeDashoffset={-o}
          />
        ))}
      </Svg>
      <View style={styles.chartCenter} pointerEvents="none">
        <Text style={styles.chartEyebrow}>{centerTop}</Text>
        <Text style={styles.chartAmount} numberOfLines={1} adjustsFontSizeToFit>
          {centerBottom}
        </Text>
      </View>
    </View>
  )
}

const now = new Date()

const ReportScreen = () => {
  const { theme } = useTheme()
  const styles = useThemedStyles(makeStyles)
  const insets = useSafeAreaInsets()
  const navigate = useNavigate()
  const [side, setSide] = useState<ReportSide>("expense")
  // Cursor into the month being reported; starts on the current month.
  const [cursor, setCursor] = useState({
    year: now.getFullYear(),
    month: now.getMonth(),
  })

  const { start, end } = useMemo(
    () => monthBounds(cursor.year, cursor.month),
    [cursor],
  )
  const label = `${MONTHS_ES[cursor.month]} ${cursor.year}`
  const isCurrentMonth =
    cursor.year === now.getFullYear() && cursor.month === now.getMonth()

  const shiftMonth = (delta: number) =>
    setCursor(({ year, month }) => {
      const d = new Date(year, month + delta, 1)
      return { year: d.getFullYear(), month: d.getMonth() }
    })

  const { report, loading } = useCategoryReport({ start, end, type: side })
  const { trend } = useCategoryTrend({
    year: cursor.year,
    month: cursor.month + 1, // API expects 1-12
    type: side,
  })

  const colorFor = (item: CategoryReportItem) =>
    getTone(theme.categoryTones, item.categoryId).fg

  // For expenses, spending MORE is "bad" (neg color); for income, earning more
  // is "good" (pos color). Flip the sign meaning by side.
  const deltaColor = (delta: number) => {
    if (delta === 0) return theme.palette.ink4
    const isGood = side === "expense" ? delta < 0 : delta > 0
    return isGood ? theme.palette.pos : theme.palette.neg
  }

  const items = report?.items ?? []
  const hasData = items.length > 0
  // Only movers that actually changed, biggest first (already sorted by API).
  const movers = (trend?.items ?? []).filter((i) => i.delta !== 0).slice(0, 5)

  return (
    <Screen style={{ paddingTop: insets.top }}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigate("/")}
          accessibilityRole="button"
          accessibilityLabel="Volver al inicio"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="chevron-back" size={22} color={theme.palette.ink} />
        </TouchableOpacity>
        <Text style={styles.title}>Informe por categoría</Text>
      </View>

      {/* Month switcher */}
      <View style={styles.monthSwitcher}>
        <TouchableOpacity
          onPress={() => shiftMonth(-1)}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityRole="button"
          accessibilityLabel="Mes anterior"
        >
          <Ionicons name="chevron-back" size={22} color={theme.palette.ink3} />
        </TouchableOpacity>
        <Text style={styles.monthLabel}>{label}</Text>
        <TouchableOpacity
          onPress={() => shiftMonth(1)}
          disabled={isCurrentMonth}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityRole="button"
          accessibilityLabel="Mes siguiente"
        >
          <Ionicons
            name="chevron-forward"
            size={22}
            color={isCurrentMonth ? theme.palette.ink5 : theme.palette.ink3}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.toggleRow}>
        {(["expense", "income"] as ReportSide[]).map((s) => (
          <TouchableOpacity
            key={s}
            style={[styles.togglePill, side === s && styles.togglePillActive]}
            onPress={() => setSide(s)}
          >
            <Text
              style={[
                styles.togglePillText,
                side === s && styles.togglePillTextActive,
              ]}
            >
              {s === "expense" ? "Gastos" : "Ingresos"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.centered}>
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      ) : !hasData ? (
        <View style={styles.centered}>
          <Text style={[styles.emptyText, { textAlign: "center" }]}>
            No hay {side === "expense" ? "gastos" : "ingresos"} este mes
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.chartCard}>
            <DonutChart
              items={items}
              colorFor={colorFor}
              centerTop={side === "expense" ? "gastado" : "ingresado"}
              centerBottom={`$${formatNumber(report!.grandTotal)}`}
            />
            {report?.top && (
              <Text style={styles.topLine}>
                Mayor {side === "expense" ? "gasto" : "ingreso"}:{" "}
                <Text style={styles.topLineStrong}>{report.top.name}</Text> (
                {Math.round(report.top.share * 100)}%)
              </Text>
            )}
          </View>

          <View style={styles.list}>
            {items.map((item) => (
              <View key={item.categoryId} style={styles.row}>
                <View style={styles.rowLeft}>
                  <View
                    style={[styles.dot, { backgroundColor: colorFor(item) }]}
                  />
                  <CategoryChip
                    categoryId={item.categoryId}
                    name={item.name}
                    icon={item.icon}
                    size="sm"
                  />
                  <Text style={styles.rowName} numberOfLines={1}>
                    {item.name}
                  </Text>
                </View>
                <View style={styles.rowRight}>
                  <AmountText
                    value={item.total}
                    prefix="$"
                    style={styles.rowAmount}
                  />
                  <Text style={styles.rowShare}>
                    {Math.round(item.share * 100)}%
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {movers.length > 0 && (
            <View style={styles.trendSection}>
              <Text style={styles.sectionTitle}>
                Tendencias vs. mes anterior
              </Text>
              {movers.map((item: CategoryTrendItem) => {
                const up = item.delta > 0
                const color = deltaColor(item.delta)
                return (
                  <View key={item.categoryId} style={styles.trendRow}>
                    <View style={styles.rowLeft}>
                      <Ionicons
                        name={up ? "arrow-up" : "arrow-down"}
                        size={16}
                        color={color}
                      />
                      <Text style={styles.rowName} numberOfLines={1}>
                        {item.name}
                      </Text>
                    </View>
                    <View style={styles.rowRight}>
                      <AmountText
                        value={item.delta}
                        prefix={`${up ? "+" : "−"}$`}
                        style={[styles.trendDelta, { color }]}
                      />
                      <Text style={styles.rowShare}>
                        {item.deltaPct === null
                          ? "nuevo"
                          : `${up ? "+" : "−"}${Math.round(
                              Math.abs(item.deltaPct) * 100,
                            )}%`}
                      </Text>
                    </View>
                  </View>
                )
              })}
            </View>
          )}
        </ScrollView>
      )}
    </Screen>
  )
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 16,
      paddingTop: 20,
      paddingBottom: 12,
    },
    backButton: {
      width: 32,
      height: 32,
      alignItems: "center",
      justifyContent: "center",
    },
    title: {
      fontFamily: theme.fonts.serif,
      fontSize: 24,
      color: theme.palette.ink,
    },
    monthSwitcher: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 24,
      paddingHorizontal: 20,
      paddingBottom: 8,
    },
    monthLabel: {
      fontFamily: theme.fonts.mono,
      fontSize: 13,
      color: theme.palette.ink,
      letterSpacing: 0.5,
      textTransform: "uppercase",
      minWidth: 140,
      textAlign: "center",
    },
    toggleRow: {
      flexDirection: "row",
      gap: 8,
      paddingHorizontal: 20,
      paddingBottom: 8,
    },
    togglePill: {
      paddingHorizontal: 16,
      paddingVertical: 7,
      borderRadius: 20,
      backgroundColor: theme.palette.surface3,
    },
    togglePillActive: {
      backgroundColor: theme.palette.accent,
    },
    togglePillText: {
      fontSize: 13,
      fontFamily: theme.fonts.sans,
      color: theme.palette.ink3,
    },
    togglePillTextActive: {
      color: theme.palette.bg,
    },
    centered: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 20,
      padding: 30,
    },
    loadingText: {
      fontSize: 14,
      color: theme.palette.ink4,
      fontFamily: theme.fonts.sans,
    },
    emptyText: {
      fontSize: 15,
      color: theme.palette.ink3,
      fontFamily: theme.fonts.sans,
      lineHeight: 22,
    },
    content: {
      padding: 20,
      gap: 20,
    },
    chartCard: {
      backgroundColor: theme.palette.surface,
      borderRadius: 20,
      padding: 24,
      alignItems: "center",
      gap: 16,
    },
    chartWrap: {
      width: CHART_SIZE,
      height: CHART_SIZE,
      alignItems: "center",
      justifyContent: "center",
    },
    chartCenter: {
      ...StyleSheet.absoluteFillObject,
      alignItems: "center",
      justifyContent: "center",
    },
    chartEyebrow: {
      fontFamily: theme.fonts.mono,
      fontSize: 11,
      color: theme.palette.ink4,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    chartAmount: {
      fontFamily: theme.amountFamily,
      fontSize: 24,
      color: theme.palette.ink,
      marginTop: 2,
      ...theme.numeric,
    },
    topLine: {
      fontSize: 14,
      fontFamily: theme.fonts.sans,
      color: theme.palette.ink3,
      textAlign: "center",
    },
    topLineStrong: {
      color: theme.palette.ink,
      fontFamily: theme.fonts.sans,
    },
    list: {
      gap: 4,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 10,
    },
    rowLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      flexShrink: 1,
    },
    dot: {
      width: 10,
      height: 10,
      borderRadius: 5,
    },
    rowName: {
      fontSize: 15,
      fontFamily: theme.fonts.sans,
      color: theme.palette.ink,
      flexShrink: 1,
    },
    rowRight: {
      alignItems: "flex-end",
    },
    rowAmount: {
      fontFamily: theme.amountFamily,
      fontSize: 15,
      color: theme.palette.ink,
      ...theme.numeric,
    },
    rowShare: {
      fontFamily: theme.fonts.mono,
      fontSize: 11,
      color: theme.palette.ink4,
    },
    trendSection: {
      marginTop: 8,
      paddingTop: 16,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.palette.line2,
      gap: 4,
    },
    sectionTitle: {
      fontFamily: theme.fonts.mono,
      fontSize: 11,
      color: theme.palette.ink4,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginBottom: 6,
    },
    trendRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 8,
    },
    trendDelta: {
      fontFamily: theme.amountFamily,
      fontSize: 15,
      ...theme.numeric,
    },
  })

export default ReportScreen
