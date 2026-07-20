import { View, StyleSheet } from "react-native"
import { StyledText } from "./StyledText"
import grafito from "../theme"
import { PdfReconciliation } from "../../types"

interface ReconciliationBannerProps {
  reconciliation: PdfReconciliation
}

// Reconciliation is advisory, statement-level metadata — it never blocks
// confirm. This component only decides what (if anything) to render:
// - not available -> nothing
// - available and reconciled -> a subtle confirmed chip
// - available and NOT reconciled -> a visible mismatch banner with the diff
export const ReconciliationBanner = ({
  reconciliation,
}: ReconciliationBannerProps) => {
  if (!reconciliation.available) return null

  if (reconciliation.reconciled) {
    return (
      <View style={styles.confirmedContainer}>
        <StyledText style={styles.confirmedIcon}>✓</StyledText>
        <StyledText style={styles.confirmedText}>
          Saldo conciliado con el extracto
        </StyledText>
      </View>
    )
  }

  const difference = reconciliation.difference ?? 0

  return (
    <View style={styles.mismatchContainer}>
      <StyledText style={styles.mismatchIcon}>⚠</StyledText>
      <StyledText style={styles.mismatchText}>
        El saldo no concilia con el extracto (diferencia:{" "}
        {difference.toFixed(2)}
        ). Podés revisar y confirmar igual.
      </StyledText>
    </View>
  )
}

const styles = StyleSheet.create({
  mismatchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: grafito.warnBg,
    borderLeftWidth: 3,
    borderLeftColor: grafito.warn,
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginTop: 16,
  },
  mismatchIcon: {
    color: grafito.warn,
    fontSize: 14,
  },
  mismatchText: {
    color: grafito.warnInk,
    fontSize: 14,
    flex: 1,
  },
  confirmedContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: grafito.posBg,
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginTop: 16,
  },
  confirmedIcon: {
    color: grafito.pos,
    fontSize: 13,
  },
  confirmedText: {
    color: grafito.pos,
    fontSize: 13,
    flex: 1,
  },
})
