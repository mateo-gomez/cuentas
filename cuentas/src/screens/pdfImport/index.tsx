import { useMemo, useState } from "react"
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useLocation, useNavigate } from "react-router-native"
import grafito from "../../theme"
import { PdfImportRow } from "../../Components/PdfImportRow"
import { OverlayLoader } from "../../Components/OverlayLoader"
import { ErrorBanner } from "../../Components/ErrorBanner"
import { ReconciliationBanner } from "../../Components/ReconciliationBanner"
import { CategoryPickerModal } from "../../Components/CategoryPickerModal"
import { AccountPickerModal } from "../../Components/AccountPickerModal"
import { usePdfImport, useCategories, useAccounts } from "../../hooks"
import { PdfConfirmRow, PdfParseResponse } from "../../../types"

// The parse result travels from the picker screen via router state so we
// don't need a second request to render the review list.
interface LocationState {
  result: PdfParseResponse
}

interface ReviewRow extends PdfConfirmRow {
  possibleDuplicate: boolean
}

const buildInitialRows = (result: PdfParseResponse): ReviewRow[] =>
  result.rows.map((row) => ({
    rowId: row.rowId,
    date: row.date,
    description: row.description,
    value: row.value,
    type: row.type,
    categoryName: row.categoryName ?? "",
    // Flagged rows default-excluded (Decision 11) — user can re-include.
    excluded: row.possibleDuplicate,
    possibleDuplicate: row.possibleDuplicate,
  }))

const PdfImportReview = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const insets = useSafeAreaInsets()
  const { confirmState, confirm } = usePdfImport()
  const { categories } = useCategories()
  const { accounts } = useAccounts()

  const state = location.state as LocationState | undefined
  const result = state?.result

  const [rows, setRows] = useState<ReviewRow[]>(() =>
    result ? buildInitialRows(result) : [],
  )
  const [pickerRowId, setPickerRowId] = useState<string | null>(null)
  const [accountId, setAccountId] = useState("")
  const [accountPickerVisible, setAccountPickerVisible] = useState(false)

  const selectedAccountName = accounts.find(
    (account) => account._id === accountId,
  )?.name

  const includedCount = useMemo(
    () => rows.filter((row) => !row.excluded).length,
    [rows],
  )

  if (!result) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <Text style={styles.title}>Revisión</Text>
        <ErrorBanner message="No hay una importación en curso para revisar." />
      </View>
    )
  }

  const updateRow = (rowId: string, changes: Partial<ReviewRow>) => {
    setRows((current) =>
      current.map((row) => (row.rowId === rowId ? { ...row, ...changes } : row)),
    )
  }

  const removeRow = (rowId: string) => {
    setRows((current) => current.filter((row) => row.rowId !== rowId))
  }

  const handleConfirm = async () => {
    if (rows.length === 0) {
      Alert.alert("No hay transacciones para confirmar.")
      return
    }

    if (!accountId) {
      Alert.alert("Elegí una cuenta para confirmar la importación.")
      return
    }

    const payload: PdfConfirmRow[] = rows.map(
      ({ possibleDuplicate: _possibleDuplicate, ...row }) => row,
    )

    const confirmResult = await confirm(result.importSessionId, payload, accountId)

    if (confirmResult) {
      Alert.alert(
        "Importación completa",
        `Se guardaron ${confirmResult.persisted} transacciones.`,
        [{ text: "OK", onPress: () => navigate("/", { replace: true }) }],
      )
    }
  }

  const confirming = confirmState.status === "confirming"
  const confirmError =
    confirmState.status === "error" ? confirmState.message : ""

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigate(-1)}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="chevron-back" size={26} color={grafito.ink} />
        </TouchableOpacity>
        <Text style={styles.title}>Revisar importación</Text>
      </View>

      <View style={styles.summary}>
        <Text style={styles.summaryText}>
          Banco detectado: <Text style={styles.summaryStrong}>{result.bankId}</Text>
        </Text>
        <Text style={styles.summaryText}>
          {includedCount} de {rows.length} transacciones seleccionadas
        </Text>
        <TouchableOpacity
          style={styles.accountPill}
          onPress={() => setAccountPickerVisible(true)}
        >
          <Ionicons name="wallet-outline" size={14} color={grafito.ink3} />
          <Text style={styles.accountPillText} numberOfLines={1}>
            {selectedAccountName ?? "Elegir cuenta"}
          </Text>
          <Ionicons name="chevron-down" size={14} color={grafito.ink3} />
        </TouchableOpacity>
      </View>

      {confirmError ? <ErrorBanner message={confirmError} /> : null}

      <ReconciliationBanner reconciliation={result.reconciliation} />

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.list}
      >
        {rows.map((row) => (
          <PdfImportRow
            key={row.rowId}
            date={row.date}
            description={row.description}
            value={row.value}
            type={row.type}
            categoryName={row.categoryName}
            possibleDuplicate={row.possibleDuplicate}
            included={!row.excluded}
            onChangeDescription={(description) =>
              updateRow(row.rowId, { description })
            }
            onPressCategory={() => setPickerRowId(row.rowId)}
            onToggleIncluded={() => updateRow(row.rowId, { excluded: !row.excluded })}
            onRemove={() => removeRow(row.rowId)}
          />
        ))}
      </ScrollView>

      <CategoryPickerModal
        visible={pickerRowId !== null}
        categories={categories}
        selectedName={
          rows.find((row) => row.rowId === pickerRowId)?.categoryName || undefined
        }
        onSelect={(categoryName) => {
          if (pickerRowId) updateRow(pickerRowId, { categoryName })
        }}
        onClose={() => setPickerRowId(null)}
      />

      <AccountPickerModal
        visible={accountPickerVisible}
        accounts={accounts}
        selectedId={accountId || undefined}
        onSelect={setAccountId}
        onClose={() => setAccountPickerVisible(false)}
      />

      <TouchableOpacity
        style={[
          styles.confirmButton,
          { marginBottom: insets.bottom + 20 },
          (confirming || !accountId) && styles.confirmButtonDisabled,
        ]}
        onPress={handleConfirm}
        disabled={confirming || !accountId}
      >
        <Text style={styles.confirmButtonText}>
          {confirming ? "Confirmando..." : "Confirmar importación"}
        </Text>
      </TouchableOpacity>

      {confirming ? <OverlayLoader message="Guardando transacciones..." /> : null}
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
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 8,
  },
  title: {
    fontFamily: grafito.fonts.serif,
    fontSize: 20,
    color: grafito.ink,
  },
  summary: {
    paddingHorizontal: 20,
    paddingBottom: 8,
    gap: 4,
  },
  summaryText: {
    fontFamily: grafito.fonts.sans,
    fontSize: 13,
    color: grafito.ink3,
  },
  summaryStrong: {
    fontWeight: "600",
    color: grafito.ink,
  },
  accountPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    backgroundColor: grafito.surface3,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 4,
  },
  accountPillText: {
    fontFamily: grafito.fonts.sans,
    fontSize: 13,
    color: grafito.ink3,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 10,
  },
  confirmButton: {
    backgroundColor: grafito.accent,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    marginHorizontal: 20,
  },
  confirmButtonDisabled: {
    opacity: 0.4,
  },
  confirmButtonText: {
    fontFamily: grafito.fonts.sans,
    fontSize: 15,
    fontWeight: "600",
    color: grafito.onAccent,
  },
})

export default PdfImportReview
