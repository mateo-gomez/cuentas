import React, { useMemo } from "react"
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
} from "react-native"
import Svg, { Circle } from "react-native-svg"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useNavigate } from "react-router"
import CategoryChip from "../../Components/CategoryChip"
import BottomTabBar from "../../Components/BottomTabBar"
import grafito from "../../theme"
import { useBudget } from "../../hooks"
import { useCategories } from "../../hooks"
import { useTabBar } from "../../hooks"
import { formatNumber } from "../../utils"

const now = new Date()

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

// ─── Donut ring via SVG ───────────────────────────────────────────────────────
const RING_SIZE = 120
const STROKE = 14

const DonutRing = ({
  progress,
  available,
  isOver,
}: {
  progress: number
  available: number
  isOver: boolean
}) => {
  const r = (RING_SIZE - STROKE) / 2
  const cx = RING_SIZE / 2
  const cy = RING_SIZE / 2
  const circumference = 2 * Math.PI * r
  const clampedProgress = Math.min(Math.max(progress, 0), 1)
  const dashOffset = circumference * (1 - clampedProgress)

  return (
    <View style={styles.donutWrap}>
      <Svg
        width={RING_SIZE}
        height={RING_SIZE}
        style={{ transform: [{ rotate: "-90deg" }] }}
      >
        {/* Background track */}
        <Circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={grafito.line2}
          strokeWidth={STROKE}
        />
        {/* Progress arc */}
        <Circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={isOver ? grafito.neg : grafito.accent}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
        />
      </Svg>
      {/* Center text overlay */}
      <View style={styles.donutCenter} pointerEvents="none">
        <Text style={styles.donutEyebrow}>disponible</Text>
        <Text
          style={[
            styles.donutAmount,
            { color: isOver ? grafito.neg : grafito.ink },
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {isOver ? "-" : ""}${formatNumber(Math.abs(available))}
        </Text>
      </View>
    </View>
  )
}

// ─── Category row ─────────────────────────────────────────────────────────────
const CategoryRow = ({
  categoryId,
  name,
  icon,
  spent,
  allocated,
  remaining,
  isOver,
}: {
  categoryId: string
  name: string
  icon?: string
  spent: number
  allocated: number
  remaining: number
  isOver: boolean
}) => {
  const pct = allocated > 0 ? Math.min(spent / allocated, 1) : 0
  const remainingColor = isOver ? grafito.neg : grafito.pos

  return (
    <View style={styles.catRow}>
      <View style={styles.catTop}>
        <CategoryChip
          categoryId={categoryId}
          name={name}
          icon={icon}
          size="sm"
        />
        <Text style={styles.catName} numberOfLines={1}>
          {name}
        </Text>
        <Text style={[styles.catRemaining, { color: remainingColor }]}>
          {isOver
            ? `-$${formatNumber(Math.abs(remaining))}`
            : allocated > 0
            ? `$${formatNumber(remaining)}`
            : "Sin límite"}
        </Text>
      </View>
      {allocated > 0 && (
        <View style={styles.catBarTrack}>
          <View
            style={[
              styles.catBarFill,
              {
                width: `${pct * 100}%`,
                backgroundColor: isOver ? grafito.neg : grafito.accent,
              },
            ]}
          />
        </View>
      )}
    </View>
  )
}

// ─── Main screen ──────────────────────────────────────────────────────────────
const BudgetScreen = () => {
  const navigate = useNavigate()
  const tabBar = useTabBar()
  const insets = useSafeAreaInsets()
  const { status, loading } = useBudget(now.getFullYear(), now.getMonth() + 1)
  const { categories } = useCategories()

  const budget = status?.budget ?? null
  const totalSpent = status?.totalSpent ?? 0
  const totalRemaining = status?.totalRemaining ?? 0
  const isOver = status?.isOverBudget ?? false
  const progress = budget && budget.total > 0 ? totalSpent / budget.total : 0

  // Build a lookup map: category _id → { name, icon }
  const catMap = useMemo(() => {
    const map: Record<string, { name: string; icon: string }> = {}
    for (const c of categories) {
      if (c._id) map[c._id] = { name: c.name, icon: c.icon }
    }
    return map
  }, [categories])

  const monthLabel = MONTHS_ES[now.getMonth()]

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* ── Inline header ─────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>{monthLabel}</Text>
          <Text style={styles.title}>Presupuesto</Text>
        </View>
        <TouchableOpacity
          style={styles.configPill}
          onPress={() => navigate("/budget/edit")}
        >
          <Text style={styles.configPillText}>Configurar</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      ) : !budget ? (
        <View style={styles.centered}>
          <Text style={[styles.emptyText, { textAlign: "center" }]}>
            No tienes un presupuesto configurado
          </Text>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => navigate("/budget/edit")}
          >
            <Text style={styles.ctaButtonText}>Configurar presupuesto</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {/* ── Hero card ─────────────────────────────────────────────────── */}
          <View style={styles.heroCard}>
            <DonutRing
              progress={progress}
              available={totalRemaining}
              isOver={isOver}
            />

            {/* Stats row */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>GASTADO</Text>
                <Text style={styles.statValue}>
                  ${formatNumber(totalSpent)}
                </Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>META</Text>
                <Text style={styles.statValue}>
                  ${formatNumber(budget.total)}
                </Text>
              </View>
            </View>
          </View>

          {/* ── Category list ─────────────────────────────────────────────── */}
          {(status?.categories ?? [])
            .filter((c) => c.allocated > 0 || c.spent > 0)
            .map((cat) => {
              const info = catMap[cat.categoryId]
              const name = info?.name ?? cat.categoryId
              const icon = info?.icon
              return (
                <CategoryRow
                  key={cat.categoryId}
                  categoryId={cat.categoryId}
                  name={name}
                  icon={icon}
                  spent={cat.spent}
                  allocated={cat.allocated}
                  remaining={cat.remaining}
                  isOver={cat.isOver}
                />
              )
            })}
        </ScrollView>
      )}

      <BottomTabBar {...tabBar} />
    </View>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: grafito.bg,
  },
  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  eyebrow: {
    fontFamily: grafito.fonts.mono,
    fontSize: 11,
    color: grafito.ink4,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  title: {
    fontFamily: grafito.fonts.serif,
    fontSize: 26,
    color: grafito.ink,
    marginTop: 2,
  },
  configPill: {
    backgroundColor: grafito.surface3,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  configPillText: {
    fontSize: 13,
    color: grafito.ink3,
    fontFamily: grafito.fonts.sans,
  },
  // Loading / empty states
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    padding: 30,
  },
  loadingText: {
    fontSize: 14,
    color: grafito.ink4,
    fontFamily: grafito.fonts.sans,
  },
  emptyText: {
    fontSize: 15,
    color: grafito.ink3,
    fontFamily: grafito.fonts.sans,
    lineHeight: 22,
  },
  ctaButton: {
    backgroundColor: grafito.accent,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  ctaButtonText: {
    color: grafito.onAccent,
    fontFamily: grafito.fonts.sans,
    fontWeight: "600",
    fontSize: 15,
  },
  // Scroll content
  content: {
    padding: 16,
    gap: 0,
  },
  // Hero card
  heroCard: {
    backgroundColor: grafito.surface,
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 20,
    marginBottom: 16,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    gap: 20,
  },
  // Donut
  donutWrap: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  donutCenter: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: STROKE + 4,
    alignItems: "center",
    justifyContent: "center",
  },
  donutEyebrow: {
    fontFamily: grafito.fonts.mono,
    fontSize: 10,
    color: grafito.ink4,
    letterSpacing: 0.3,
    textTransform: "lowercase",
  },
  donutAmount: {
    fontFamily: grafito.fonts.serif,
    fontSize: 22,
    color: grafito.ink,
    marginTop: 1,
  },
  // Stats row
  statsRow: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-around",
    alignItems: "center",
  },
  statItem: {
    alignItems: "center",
    gap: 2,
  },
  statLabel: {
    fontFamily: grafito.fonts.mono,
    fontSize: 11,
    color: grafito.ink4,
    letterSpacing: 0.4,
  },
  statValue: {
    fontFamily: grafito.fonts.serif,
    fontSize: 16,
    color: grafito.ink,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: grafito.line2,
  },
  // Category rows
  catRow: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: grafito.line2,
    gap: 8,
  },
  catTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  catName: {
    flex: 1,
    fontSize: 14,
    color: grafito.ink2,
    fontFamily: grafito.fonts.sans,
  },
  catRemaining: {
    fontSize: 13,
    fontFamily: grafito.fonts.serif,
  },
  catBarTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: grafito.line2,
    overflow: "hidden",
    marginLeft: 38, // align with text after chip
  },
  catBarFill: {
    height: "100%",
    borderRadius: 2,
  },
})

export default BudgetScreen
