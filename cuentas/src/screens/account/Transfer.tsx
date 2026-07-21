import { useMemo, useState } from "react"
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useNavigate } from "react-router"
import { useTheme, useThemedStyles } from "../../theme/index"
import type { Theme } from "../../theme/index"
import { useAccounts } from "../../hooks"
import { AccountPickerModal } from "../../Components/AccountPickerModal"
import { OverlayLoader } from "../../Components/OverlayLoader"
import { createTransfer } from "../../services"
import { isApiError } from "../../helpers"
import { notify } from "../../utils/notify"
import { Account } from "../../../types"

type PickerField = "from" | "to" | null

// A single account slot in the From → To flow. Tapping it opens the picker.
const AccountSlot = ({
  label,
  account,
  onPress,
}: {
  label: string
  account?: Account
  onPress: () => void
}) => {
  const { theme } = useTheme()
  const styles = useThemedStyles(makeStyles)
  return (
  <TouchableOpacity
    style={styles.slot}
    onPress={onPress}
    activeOpacity={0.7}
    accessibilityRole="button"
    accessibilityLabel={`${label}: ${account?.name ?? "sin elegir"}`}
  >
    <Text style={styles.slotLabel}>{label}</Text>
    <View style={styles.slotBody}>
      <View style={styles.slotIcon}>
        <Ionicons
          name={
            account
              ? account.type === "credit"
                ? "card-outline"
                : "wallet-outline"
              : "ellipse-outline"
          }
          size={20}
          color={account ? theme.palette.accent : theme.palette.ink4}
        />
      </View>
      <Text
        style={[styles.slotName, !account && styles.slotPlaceholder]}
        numberOfLines={1}
      >
        {account?.name ?? "Elegir cuenta"}
      </Text>
      <Ionicons name="chevron-down" size={16} color={theme.palette.ink4} />
    </View>
  </TouchableOpacity>
  )
}

const AccountTransfer = () => {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const styles = useThemedStyles(makeStyles)
  const insets = useSafeAreaInsets()
  const { accounts } = useAccounts()

  const [fromId, setFromId] = useState("")
  const [toId, setToId] = useState("")
  const [amountText, setAmountText] = useState("")
  const [description, setDescription] = useState("")
  const [picker, setPicker] = useState<PickerField>(null)
  const [submitting, setSubmitting] = useState(false)

  const fromAccount = accounts.find((account) => account._id === fromId)
  const toAccount = accounts.find((account) => account._id === toId)

  // Destination options exclude the chosen source (and vice versa) — you can't
  // transfer an account to itself.
  const pickerAccounts = useMemo(() => {
    if (picker === "from")
      return accounts.filter((account) => account._id !== toId)
    if (picker === "to")
      return accounts.filter((account) => account._id !== fromId)
    return accounts
  }, [accounts, picker, fromId, toId])

  const amount = Number(amountText.replace(",", "."))
  const amountValid = Number.isFinite(amount) && amount > 0
  const canSubmit = !!fromId && !!toId && fromId !== toId && amountValid

  const swap = () => {
    setFromId(toId)
    setToId(fromId)
  }

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return

    setSubmitting(true)
    try {
      await createTransfer({
        fromAccountId: fromId,
        toAccountId: toId,
        value: amount,
        date: new Date(),
        description: description.trim(),
      })
      notify.success(
        "Transferencia creada",
        `Se movieron $${amount.toLocaleString("es-CO")}.`,
      )
      navigate("/accounts", { replace: true })
    } catch (error) {
      const message = isApiError(error)
        ? error.message
        : "No pudimos crear la transferencia. Intentá de nuevo."
      notify.error("Error", message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigate(-1)}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityRole="button"
          accessibilityLabel="Volver"
        >
          <Ionicons name="chevron-back" size={26} color={theme.palette.ink} />
        </TouchableOpacity>
        <Text style={styles.title}>Transferir</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.caption}>
            Mové dinero entre tus cuentas. No cuenta como gasto ni ingreso.
          </Text>

          {/* Signature: the From → To flow with a swap control on the divider. */}
          <View style={styles.flow}>
            <AccountSlot
              label="Desde"
              account={fromAccount}
              onPress={() => setPicker("from")}
            />

            <View style={styles.swapRow}>
              <View style={styles.flowLine} />
              <TouchableOpacity
                style={styles.swapButton}
                onPress={swap}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel="Invertir origen y destino"
              >
                <Ionicons
                  name="swap-vertical"
                  size={18}
                  color={theme.palette.onAccent}
                />
              </TouchableOpacity>
              <View style={styles.flowLine} />
            </View>

            <AccountSlot
              label="Hacia"
              account={toAccount}
              onPress={() => setPicker("to")}
            />
          </View>

          <View style={styles.amountBox}>
            <Text style={styles.amountLabel}>Monto</Text>
            <View style={styles.amountRow}>
              <Text style={styles.amountCurrency}>$</Text>
              <TextInput
                style={styles.amountInput}
                value={amountText}
                onChangeText={setAmountText}
                placeholder="0"
                placeholderTextColor={theme.palette.ink5}
                keyboardType="decimal-pad"
                accessibilityLabel="Monto a transferir"
              />
            </View>
          </View>

          <View style={styles.descriptionBox}>
            <Text style={styles.amountLabel}>Descripción (opcional)</Text>
            <TextInput
              style={styles.descriptionInput}
              value={description}
              onChangeText={setDescription}
              placeholder="Ej. Pago tarjeta"
              placeholderTextColor={theme.palette.ink4}
            />
          </View>
        </ScrollView>

        <TouchableOpacity
          style={[
            styles.cta,
            { marginBottom: insets.bottom + 16 },
            (!canSubmit || submitting) && styles.ctaDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!canSubmit || submitting}
          accessibilityRole="button"
        >
          <Text style={styles.ctaText}>
            {submitting ? "Transfiriendo..." : "Transferir"}
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>

      <AccountPickerModal
        visible={picker !== null}
        accounts={pickerAccounts}
        selectedId={(picker === "from" ? fromId : toId) || undefined}
        onSelect={(id) => (picker === "from" ? setFromId(id) : setToId(id))}
        onClose={() => setPicker(null)}
      />

      {submitting ? (
        <OverlayLoader message="Creando transferencia..." />
      ) : null}
    </View>
  )
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.palette.bg,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerSpacer: {
    width: 26,
  },
  title: {
    fontFamily: theme.fonts.serif,
    fontSize: 20,
    color: theme.palette.ink,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
    gap: 20,
  },
  caption: {
    fontFamily: theme.fonts.sans,
    fontSize: 13,
    color: theme.palette.ink3,
    lineHeight: 19,
  },
  flow: {
    backgroundColor: theme.palette.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.palette.line,
    padding: 16,
  },
  slot: {
    gap: 6,
  },
  slotLabel: {
    fontFamily: theme.fonts.sans,
    fontSize: 12,
    fontWeight: "600",
    color: theme.palette.ink4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  slotBody: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  slotIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.palette.surface3,
    alignItems: "center",
    justifyContent: "center",
  },
  slotName: {
    flex: 1,
    fontFamily: theme.fonts.sans,
    fontSize: 16,
    color: theme.palette.ink,
  },
  slotPlaceholder: {
    color: theme.palette.ink4,
  },
  swapRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingLeft: 4,
  },
  flowLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.palette.line,
  },
  swapButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.palette.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  amountBox: {
    gap: 8,
  },
  amountLabel: {
    fontFamily: theme.fonts.sans,
    fontSize: 12,
    fontWeight: "600",
    color: theme.palette.ink4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: theme.palette.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.palette.line,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  amountCurrency: {
    fontFamily: theme.amountFamily,
    ...theme.numeric,
    fontSize: 28,
    color: theme.palette.ink4,
  },
  amountInput: {
    flex: 1,
    fontFamily: theme.amountFamily,
    ...theme.numeric,
    fontSize: 32,
    color: theme.palette.ink,
    padding: 0,
  },
  descriptionBox: {
    gap: 8,
  },
  descriptionInput: {
    fontFamily: theme.fonts.sans,
    fontSize: 15,
    color: theme.palette.ink,
    backgroundColor: theme.palette.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.palette.line,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  cta: {
    backgroundColor: theme.palette.accent,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    marginHorizontal: 20,
  },
  ctaDisabled: {
    opacity: 0.4,
  },
  ctaText: {
    fontFamily: theme.fonts.sans,
    fontSize: 15,
    fontWeight: "600",
    color: theme.palette.onAccent,
  },
  })

export default AccountTransfer
