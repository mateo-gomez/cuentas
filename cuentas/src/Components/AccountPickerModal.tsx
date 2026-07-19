import {
  FlatList,
  Modal,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native"
import { useEffect, useRef } from "react"
import { Ionicons } from "@expo/vector-icons"
import grafito from "../theme"
import { StyledText } from "./StyledText"
import { Account } from "../../types"

interface AccountPickerModalProps {
  visible: boolean
  accounts: Account[]
  selectedId?: string
  onSelect: (accountId: string) => void
  onClose: () => void
  // When true, prepends an "All accounts" option that clears the selection.
  allowAll?: boolean
}

// Bottom-sheet style picker used to assign a single account — reused by the
// Home monthly-view filter (allowAll) and the PDF import review (one account
// per batch, allowAll=false). Mirrors CategoryPickerModal.
export const AccountPickerModal = ({
  visible,
  accounts,
  selectedId,
  onSelect,
  onClose,
  allowAll = false,
}: AccountPickerModalProps) => {
  const sheetRef = useRef<View>(null)

  // On web, move keyboard focus into the sheet when it opens — onto the selected
  // account if there is one, else the first row — so it's operable without a mouse.
  useEffect(() => {
    if (!visible || Platform.OS !== "web") return
    const id = requestAnimationFrame(() => {
      const node = sheetRef.current as unknown as HTMLElement | null
      if (!node) return
      const target =
        node.querySelector<HTMLElement>('[data-a11y-account="selected"]') ??
        node.querySelector<HTMLElement>("[data-a11y-account]")
      target?.focus()
    })
    return () => cancelAnimationFrame(id)
  }, [visible])

  // Arrow-key navigation between account rows while the sheet is open (web).
  useEffect(() => {
    if (!visible || Platform.OS !== "web") return
    const onKeyDown = (ev: KeyboardEvent) => {
      if (ev.key !== "ArrowDown" && ev.key !== "ArrowUp") return
      const node = sheetRef.current as unknown as HTMLElement | null
      if (!node) return
      const rows = Array.from(
        node.querySelectorAll<HTMLElement>("[data-a11y-account]"),
      )
      if (rows.length === 0) return
      ev.preventDefault()
      const current = rows.indexOf(document.activeElement as HTMLElement)
      const next =
        ev.key === "ArrowDown"
          ? Math.min(current + 1, rows.length - 1)
          : Math.max(current - 1, 0)
      rows[next < 0 ? 0 : next]?.focus()
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [visible])

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity ref={sheetRef} style={styles.sheet} activeOpacity={1}>
          <View style={styles.header}>
            <StyledText style={styles.title}>Elegir cuenta</StyledText>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close" size={22} color={grafito.ink3} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={accounts}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.list}
            ListHeaderComponent={
              allowAll ? (
                <TouchableOpacity
                  // @ts-expect-error dataSet is a react-native-web prop
                  dataSet={{ a11yAccount: !selectedId ? "selected" : "row" }}
                  style={[styles.row, !selectedId && styles.rowActive]}
                  onPress={() => {
                    onSelect("")
                    onClose()
                  }}
                >
                  <View style={styles.icon}>
                    <Ionicons
                      name="layers-outline"
                      size={18}
                      color={grafito.accent}
                    />
                  </View>
                  <StyledText style={styles.rowLabel}>Todo</StyledText>
                  {!selectedId ? (
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color={grafito.accent}
                    />
                  ) : null}
                </TouchableOpacity>
              ) : null
            }
            renderItem={({ item }) => {
              const active = item._id === selectedId
              return (
                <TouchableOpacity
                  // @ts-expect-error dataSet is a react-native-web prop
                  dataSet={{ a11yAccount: active ? "selected" : "row" }}
                  style={[styles.row, active && styles.rowActive]}
                  onPress={() => {
                    onSelect(item._id)
                    onClose()
                  }}
                >
                  <View style={styles.icon}>
                    <Ionicons
                      name={
                        item.type === "credit"
                          ? "card-outline"
                          : "wallet-outline"
                      }
                      size={18}
                      color={grafito.accent}
                    />
                  </View>
                  <StyledText style={styles.rowLabel}>{item.name}</StyledText>
                  {active ? (
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color={grafito.accent}
                    />
                  ) : null}
                </TouchableOpacity>
              )
            }}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: grafito.bg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    maxHeight: "70%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  title: {
    fontFamily: grafito.fonts.serif,
    fontSize: 18,
    color: grafito.ink,
  },
  list: {
    paddingHorizontal: 12,
    paddingBottom: 24,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  rowActive: {
    backgroundColor: grafito.surface3,
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: grafito.surface3,
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: {
    flex: 1,
    fontFamily: grafito.fonts.sans,
    fontSize: 15,
    color: grafito.ink,
  },
})
