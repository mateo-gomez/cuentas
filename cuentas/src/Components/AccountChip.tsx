import React, { useState } from "react"
import { StyleSheet, Text, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import grafito from "../theme"
import { useAccounts } from "../hooks"
import { AccountPickerModal } from "./AccountPickerModal"

interface Props {
  accountId?: string
  onSelect: (accountId: string) => void
}

// Reusable account selector mirroring CategoryChip's role in the transaction
// screen metaRow: shows the current account and opens the shared
// AccountPickerModal (same one used by Home's account filter) to change it.
export default function AccountChip({ accountId, onSelect }: Props) {
  const { accounts } = useAccounts()
  const [visible, setVisible] = useState(false)
  const selectedAccount = accounts.find((account) => account._id === accountId)

  return (
    <>
      <TouchableOpacity
        style={styles.chip}
        onPress={() => setVisible(true)}
        accessibilityRole="button"
        accessibilityLabel={`Cuenta: ${
          selectedAccount?.name ?? "elegir cuenta"
        }`}
      >
        <Ionicons
          name={
            selectedAccount?.type === "credit"
              ? "card-outline"
              : "wallet-outline"
          }
          size={16}
          color={grafito.ink3}
        />
        <Text style={styles.label} numberOfLines={1}>
          {selectedAccount?.name ?? "Elegir cuenta"}
        </Text>
        <Ionicons name="chevron-forward" size={16} color={grafito.ink4} />
      </TouchableOpacity>

      <AccountPickerModal
        visible={visible}
        accounts={accounts}
        selectedId={accountId}
        onSelect={onSelect}
        onClose={() => setVisible(false)}
      />
    </>
  )
}

const styles = StyleSheet.create({
  chip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 6,
    paddingVertical: 4,
  },
  label: {
    fontSize: 14,
    color: grafito.ink2,
    flexShrink: 1,
  },
})
