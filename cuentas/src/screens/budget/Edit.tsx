import { useEffect, useState } from "react"
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useNavigate } from "react-router"
import CategoryChip from "../../Components/CategoryChip"
import { useTheme, useThemedStyles } from "../../theme/index"
import type { Theme } from "../../theme/index"
import { useBudget, useCategories } from "../../hooks"
import { saveBudget } from "../../services"
import { BudgetCategoryAllocation } from "../../../types"
import { createLogger } from "../../lib/logger"

const logger = createLogger("BudgetEdit")

const now = new Date()
const YEAR = now.getFullYear()
const MONTH = now.getMonth() + 1

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

const BudgetEdit = () => {
  const { theme } = useTheme()
  const styles = useThemedStyles(makeStyles)
  const navigate = useNavigate()
  const insets = useSafeAreaInsets()
  const { status } = useBudget(YEAR, MONTH)
  const { categories } = useCategories()

  const [total, setTotal] = useState("")
  const [allocations, setAllocations] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (status?.budget) {
      setTotal(String(status.budget.total))
      const alloc: Record<string, string> = {}
      for (const c of status.budget.categories) {
        alloc[c.categoryId] = String(c.allocated)
      }
      setAllocations(alloc)
    }
  }, [status?.budget])

  const handleSave = async () => {
    const totalNum = parseFloat(total)
    if (!total || isNaN(totalNum) || totalNum <= 0) {
      setError("Ingresa un monto total válido")
      return
    }

    const categoryAllocations: BudgetCategoryAllocation[] = Object.entries(
      allocations,
    )
      .filter(([, v]) => v && !isNaN(parseFloat(v)) && parseFloat(v) > 0)
      .map(([categoryId, v]) => ({ categoryId, allocated: parseFloat(v) }))

    try {
      setSaving(true)
      await saveBudget({
        year: YEAR,
        month: MONTH,
        total: totalNum,
        categories: categoryAllocations,
      })
      navigate("/budget")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al guardar"
      logger.error("Error saving budget", { error: message })
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigate(-1)}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={styles.cancel}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.savePill, saving && styles.savePillDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.savePillText}>{saving ? "..." : "Guardar"}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.titleBlock}>
        <Text style={styles.eyebrow}>{MONTHS_ES[now.getMonth()]}</Text>
        <Text style={styles.title}>Configurar</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <FlatList
          data={categories}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            <View style={styles.headerSection}>
              <Text style={styles.fieldLabel}>Monto total del mes</Text>
              <TextInput
                style={styles.totalInput}
                placeholder="Ej: 2000000"
                placeholderTextColor={theme.palette.ink5}
                keyboardType="numeric"
                value={total}
                onChangeText={(t) => {
                  setTotal(t)
                  setError("")
                }}
              />
              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <Text style={[styles.fieldLabel, styles.sectionTitle]}>
                Por categoría <Text style={styles.optional}>(opcional)</Text>
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.categoryRow}>
              <CategoryChip
                categoryId={item._id}
                name={item.name}
                icon={item.icon}
                size="sm"
              />
              <Text style={styles.categoryName} numberOfLines={1}>
                {item.name}
              </Text>
              <TextInput
                style={styles.categoryInput}
                placeholder="0"
                placeholderTextColor={theme.palette.ink5}
                keyboardType="numeric"
                value={allocations[item._id] ?? ""}
                onChangeText={(v) =>
                  setAllocations((prev) => ({ ...prev, [item._id]: v }))
                }
              />
            </View>
          )}
        />
      </KeyboardAvoidingView>
    </View>
  )
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    flex: {
      flex: 1,
    },
    screen: {
      flex: 1,
      backgroundColor: theme.palette.bg,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingTop: 12,
    },
    cancel: {
      fontFamily: theme.fonts.sans,
      fontSize: 15,
      color: theme.palette.ink3,
    },
    savePill: {
      backgroundColor: theme.palette.accent,
      borderRadius: 20,
      paddingHorizontal: 18,
      paddingVertical: 8,
    },
    savePillDisabled: {
      opacity: 0.5,
    },
    savePillText: {
      fontFamily: theme.fonts.sans,
      fontSize: 15,
      fontWeight: "600",
      color: theme.palette.onAccent,
    },
    titleBlock: {
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 8,
    },
    eyebrow: {
      fontFamily: theme.fonts.mono,
      fontSize: 11,
      letterSpacing: 0.5,
      color: theme.palette.ink4,
    },
    title: {
      fontFamily: theme.fonts.serif,
      fontSize: 30,
      fontWeight: "700",
      color: theme.palette.ink,
    },
    content: {
      padding: 20,
      paddingTop: 12,
    },
    headerSection: {
      marginBottom: 8,
    },
    fieldLabel: {
      fontFamily: theme.fonts.sans,
      fontSize: 13,
      fontWeight: "600",
      color: theme.palette.ink2,
      marginBottom: 8,
    },
    sectionTitle: {
      marginTop: 24,
    },
    optional: {
      fontWeight: "400",
      color: theme.palette.ink4,
    },
    totalInput: {
      backgroundColor: theme.palette.surface,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontFamily: theme.fonts.serif,
      fontSize: 22,
      color: theme.palette.ink,
      borderWidth: 1,
      borderColor: theme.palette.line,
    },
    errorText: {
      fontFamily: theme.fonts.sans,
      fontSize: 13,
      color: theme.palette.neg,
      marginTop: 8,
    },
    categoryRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.palette.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.palette.line,
      paddingHorizontal: 12,
      paddingVertical: 10,
      gap: 12,
      marginBottom: 8,
    },
    categoryName: {
      flex: 1,
      fontFamily: theme.fonts.sans,
      fontSize: 15,
      color: theme.palette.ink,
    },
    categoryInput: {
      borderWidth: 1,
      borderColor: theme.palette.line,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 8,
      width: 110,
      textAlign: "right",
      fontFamily: theme.fonts.mono,
      fontSize: 15,
      color: theme.palette.ink,
      backgroundColor: theme.palette.surface2,
    },
  })

export default BudgetEdit
