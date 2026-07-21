import { View } from "react-native"
import { StyledText } from "./StyledText"
import { useThemedStyles } from "../theme/index"
import type { Theme } from "../theme/index"
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
  const styles = useThemedStyles(makeStyles)
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

const makeStyles = (theme: Theme) => ({
  mismatchContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    backgroundColor: theme.palette.warnBg,
    borderLeftWidth: 3,
    borderLeftColor: theme.palette.warn,
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginTop: 16,
  },
  mismatchIcon: {
    color: theme.palette.warn,
    fontSize: 14,
  },
  mismatchText: {
    color: theme.palette.warnInk,
    fontSize: 14,
    flex: 1,
  },
  confirmedContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    backgroundColor: theme.palette.posBg,
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginTop: 16,
  },
  confirmedIcon: {
    color: theme.palette.pos,
    fontSize: 13,
  },
  confirmedText: {
    color: theme.palette.pos,
    fontSize: 13,
    flex: 1,
  },
})
