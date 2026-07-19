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
import grafito from "../../theme"
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
    } catch (err: any) {
      logger.error("Error saving budget", { error: err?.message })
      setError(err?.message ?? "Error al guardar")
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
                placeholderTextColor={grafito.ink5}
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
                placeholderTextColor={grafito.ink5}
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

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  screen: {
    flex: 1,
    backgroundColor: grafito.bg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  cancel: {
    fontFamily: grafito.fonts.sans,
    fontSize: 15,
    color: grafito.ink3,
  },
  savePill: {
    backgroundColor: grafito.accent,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  savePillDisabled: {
    opacity: 0.5,
  },
  savePillText: {
    fontFamily: grafito.fonts.sans,
    fontSize: 15,
    fontWeight: "600",
    color: grafito.onAccent,
  },
  titleBlock: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  eyebrow: {
    fontFamily: grafito.fonts.mono,
    fontSize: 11,
    letterSpacing: 0.5,
    color: grafito.ink4,
  },
  title: {
    fontFamily: grafito.fonts.serif,
    fontSize: 30,
    fontWeight: "700",
    color: grafito.ink,
  },
  content: {
    padding: 20,
    paddingTop: 12,
  },
  headerSection: {
    marginBottom: 8,
  },
  fieldLabel: {
    fontFamily: grafito.fonts.sans,
    fontSize: 13,
    fontWeight: "600",
    color: grafito.ink2,
    marginBottom: 8,
  },
  sectionTitle: {
    marginTop: 24,
  },
  optional: {
    fontWeight: "400",
    color: grafito.ink4,
  },
  totalInput: {
    backgroundColor: grafito.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: grafito.fonts.serif,
    fontSize: 22,
    color: grafito.ink,
    borderWidth: 1,
    borderColor: grafito.line,
  },
  errorText: {
    fontFamily: grafito.fonts.sans,
    fontSize: 13,
    color: grafito.neg,
    marginTop: 8,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: grafito.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: grafito.line,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 12,
    marginBottom: 8,
  },
  categoryName: {
    flex: 1,
    fontFamily: grafito.fonts.sans,
    fontSize: 15,
    color: grafito.ink,
  },
  categoryInput: {
    borderWidth: 1,
    borderColor: grafito.line,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    width: 110,
    textAlign: "right",
    fontFamily: grafito.fonts.mono,
    fontSize: 15,
    color: grafito.ink,
    backgroundColor: grafito.surface2,
  },
})

export default BudgetEdit
