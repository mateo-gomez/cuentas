import { useEffect, useState } from "react"
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import { useNavigate } from "react-router-native"
import { AppBar, BackButton, StyledText } from "../../Components"
import { theme } from "../../theme"
import { useBudget, useCategories } from "../../hooks"
import { saveBudget } from "../../services"
import { BudgetCategoryAllocation } from "../../../types"
import { createLogger } from "../../lib/logger"

const logger = createLogger("BudgetEdit")

const now = new Date()
const YEAR = now.getFullYear()
const MONTH = now.getMonth() + 1

const BudgetEdit = () => {
  const navigate = useNavigate()
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

    const categoryAllocations: BudgetCategoryAllocation[] = Object.entries(allocations)
      .filter(([, v]) => v && !isNaN(parseFloat(v)) && parseFloat(v) > 0)
      .map(([categoryId, v]) => ({ categoryId, allocated: parseFloat(v) }))

    try {
      setSaving(true)
      await saveBudget({ year: YEAR, month: MONTH, total: totalNum, categories: categoryAllocations })
      navigate("/budget")
    } catch (err: any) {
      logger.error("Error saving budget", { error: err?.message })
      setError(err?.message ?? "Error al guardar")
    } finally {
      setSaving(false)
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <AppBar>
        <View style={styles.appBarRow}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <BackButton />
            <StyledText color="white" fontWeight="bold">
              Configurar presupuesto
            </StyledText>
          </View>
          <TouchableOpacity onPress={handleSave} disabled={saving}>
            <StyledText color="white">{saving ? "..." : "GUARDAR"}</StyledText>
          </TouchableOpacity>
        </View>
      </AppBar>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <FlatList
          data={categories}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.content}
          ListHeaderComponent={
            <View style={styles.section}>
              <StyledText fontWeight="bold">Monto total del mes</StyledText>
              <TextInput
                style={styles.input}
                placeholder="Ej: 2000000"
                placeholderTextColor={theme.colors.grey}
                keyboardType="numeric"
                value={total}
                onChangeText={(t) => {
                  setTotal(t)
                  setError("")
                }}
              />
              {error ? (
                <StyledText color="red">{error}</StyledText>
              ) : null}

              <StyledText fontWeight="bold" style={styles.sectionTitle}>
                Por categoría (opcional)
              </StyledText>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.categoryRow}>
              <StyledText style={{ flex: 1 }}>{item.name || item.icon}</StyledText>
              <TextInput
                style={styles.categoryInput}
                placeholder="0"
                placeholderTextColor={theme.colors.grey}
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
  appBarRow: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
  },
  content: {
    padding: 16,
    gap: 8,
  },
  section: {
    gap: 10,
    marginBottom: 8,
  },
  sectionTitle: {
    marginTop: 16,
  },
  input: {
    backgroundColor: theme.colors.white,
    borderRadius: 10,
    padding: 14,
    fontSize: theme.fontSizes.subheading,
    color: theme.colors.primary,
    borderWidth: 1,
    borderColor: theme.colors.grey,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.white,
    borderRadius: 10,
    padding: 12,
    gap: 12,
    marginBottom: 6,
    elevation: 1,
  },
  categoryInput: {
    borderWidth: 1,
    borderColor: theme.colors.grey,
    borderRadius: 8,
    padding: 8,
    width: 120,
    textAlign: "right",
    color: theme.colors.primary,
    fontSize: theme.fontSizes.body,
  },
})

export default BudgetEdit
