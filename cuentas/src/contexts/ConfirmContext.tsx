import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { Modal, Pressable, StyleSheet, Text, View } from "react-native"
import grafito, { neg } from "../theme"

export type ConfirmOptions = {
  title: string
  message?: string
  confirmText?: string
  cancelText?: string
  destructive?: boolean
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>

const ConfirmContext = createContext<ConfirmFn | null>(null)

export const ConfirmProvider = ({ children }: { children: ReactNode }) => {
  const [options, setOptions] = useState<ConfirmOptions | null>(null)
  const resolverRef = useRef<((value: boolean) => void) | null>(null)

  const confirm = useCallback<ConfirmFn>((opts) => {
    setOptions(opts)
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve
    })
  }, [])

  const close = useCallback((result: boolean) => {
    resolverRef.current?.(result)
    resolverRef.current = null
    setOptions(null)
  }, [])

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Modal
        visible={options !== null}
        transparent
        animationType="fade"
        onRequestClose={() => close(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => close(false)}>
          <Pressable style={styles.card}>
            <Text style={styles.title}>{options?.title}</Text>
            {options?.message ? (
              <Text style={styles.message}>{options.message}</Text>
            ) : null}
            <View style={styles.actions}>
              <Pressable
                style={[styles.button, styles.cancelButton]}
                onPress={() => close(false)}
              >
                <Text style={styles.cancelText}>
                  {options?.cancelText ?? "Cancelar"}
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.button,
                  options?.destructive
                    ? styles.destructiveButton
                    : styles.confirmButton,
                ]}
                onPress={() => close(true)}
              >
                <Text style={styles.confirmText}>
                  {options?.confirmText ?? "Aceptar"}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ConfirmContext.Provider>
  )
}

export const useConfirm = (): ConfirmFn => {
  const ctx = useContext(ConfirmContext)
  if (!ctx) throw new Error("useConfirm must be used within a ConfirmProvider")
  return ctx
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: grafito.surface,
    borderRadius: 16,
    borderCurve: "continuous",
    padding: 20,
    gap: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
    color: grafito.ink,
  },
  message: {
    fontSize: 14,
    color: grafito.ink3,
    lineHeight: 20,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 12,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderCurve: "continuous",
  },
  cancelButton: {
    backgroundColor: grafito.surface3,
  },
  confirmButton: {
    backgroundColor: grafito.accent,
  },
  destructiveButton: {
    backgroundColor: neg,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: "500",
    color: grafito.ink2,
  },
  confirmText: {
    fontSize: 14,
    fontWeight: "600",
    color: grafito.onAccent,
  },
})
