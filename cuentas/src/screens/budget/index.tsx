import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native"
import { useNavigate } from "react-router-native"
import { AppBar, BackButton, StyledText } from "../../Components"
import { theme } from "../../theme"
import { useBudget } from "../../hooks"
import { formatNumber } from "../../utils"

const now = new Date()

const ProgressBar = ({
  spent,
  total,
  isOver,
}: {
  spent: number
  total: number
  isOver: boolean
}) => {
  const pct = total > 0 ? Math.min(spent / total, 1) : 0
  return (
    <View style={styles.progressTrack}>
      <View
        style={[
          styles.progressFill,
          {
            width: `${pct * 100}%`,
            backgroundColor: isOver ? theme.colors.red : theme.colors.secondary,
          },
        ]}
      />
    </View>
  )
}

const BudgetScreen = () => {
  const navigate = useNavigate()
  const { status, loading } = useBudget(now.getFullYear(), now.getMonth() + 1)

  const budget = status?.budget ?? null
  const totalSpent = status?.totalSpent ?? 0
  const totalRemaining = status?.totalRemaining ?? 0
  const isOver = status?.isOverBudget ?? false

  return (
    <View style={{ flex: 1 }}>
      <AppBar>
        <View style={styles.appBarRow}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <BackButton />
            <StyledText color="white" fontWeight="bold">
              Presupuesto
            </StyledText>
          </View>
          <TouchableOpacity onPress={() => navigate("/budget/edit")}>
            <StyledText color="white">CONFIGURAR</StyledText>
          </TouchableOpacity>
        </View>
      </AppBar>

      {loading ? (
        <View style={styles.centered}>
          <StyledText>Cargando...</StyledText>
        </View>
      ) : !budget ? (
        <View style={styles.centered}>
          <StyledText textCenter color="primary">
            No tienes un presupuesto configurado
          </StyledText>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => navigate("/budget/edit")}
          >
            <StyledText color="white" fontWeight="bold">
              Configurar presupuesto
            </StyledText>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.card}>
            <StyledText fontWeight="bold" fontSize="subheading">
              Total mensual
            </StyledText>
            <StyledText color="primary">
              Presupuesto: ${formatNumber(budget.total)}
            </StyledText>

            <ProgressBar spent={totalSpent} total={budget.total} isOver={isOver} />

            <View style={styles.row}>
              <StyledText color="primary">
                Gastado: ${formatNumber(totalSpent)}
              </StyledText>
              <StyledText
                style={{ color: isOver ? theme.colors.red : theme.colors.greenLight }}
                fontWeight="bold"
              >
                {isOver
                  ? `Te pasaste $${formatNumber(Math.abs(totalRemaining))}`
                  : `Te quedan $${formatNumber(totalRemaining)}`}
              </StyledText>
            </View>
          </View>

          {(status?.categories ?? [])
            .filter((c) => c.allocated > 0 || c.spent > 0)
            .map((cat) => (
              <View key={cat.categoryId} style={styles.card}>
                <View style={styles.row}>
                  <StyledText fontWeight="bold">{cat.categoryId}</StyledText>
                  <StyledText
                    style={{ color: cat.isOver ? theme.colors.red : theme.colors.textPrimary }}
                  >
                    {cat.allocated > 0
                      ? `$${formatNumber(cat.allocated)}`
                      : "Sin límite"}
                  </StyledText>
                </View>

                {cat.allocated > 0 && (
                  <ProgressBar
                    spent={cat.spent}
                    total={cat.allocated}
                    isOver={cat.isOver}
                  />
                )}

                <View style={styles.row}>
                  <StyledText color="primary">
                    Gastado: ${formatNumber(cat.spent)}
                  </StyledText>
                  {cat.allocated > 0 && (
                    <StyledText
                      style={{ color: cat.isOver ? theme.colors.red : theme.colors.greenLight }}
                    >
                      {cat.isOver
                        ? `Pasado $${formatNumber(Math.abs(cat.remaining))}`
                        : `Quedan $${formatNumber(cat.remaining)}`}
                    </StyledText>
                  )}
                </View>
              </View>
            ))}
        </ScrollView>
      )}
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
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    padding: 30,
  },
  content: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 16,
    gap: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  progressTrack: {
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.highlight,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 5,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ctaButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: "center",
  },
})

export default BudgetScreen
