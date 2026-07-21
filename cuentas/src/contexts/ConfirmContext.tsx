import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { Modal, Pressable, Text, View } from "react-native"
import { useTheme, useThemedStyles } from "../theme/index"
import type { Theme } from "../theme/index"

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
  const { theme } = useTheme()
  const styles = useThemedStyles(makeStyles)
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

const makeStyles = (theme: Theme) => ({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center" as const,
    alignItems: "center" as const,
    padding: 24,
  },
  card: {
    width: "100%" as const,
    maxWidth: 340,
    backgroundColor: theme.palette.surface,
    borderRadius: 16,
    borderCurve: "continuous" as const,
    padding: 20,
    gap: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: "600" as const,
    color: theme.palette.ink,
  },
  message: {
    fontSize: 14,
    color: theme.palette.ink3,
    lineHeight: 20,
  },
  actions: {
    flexDirection: "row" as const,
    justifyContent: "flex-end" as const,
    gap: 8,
    marginTop: 12,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderCurve: "continuous" as const,
  },
  cancelButton: {
    backgroundColor: theme.palette.surface3,
  },
  confirmButton: {
    backgroundColor: theme.palette.accent,
  },
  destructiveButton: {
    backgroundColor: theme.palette.neg,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: theme.palette.ink2,
  },
  confirmText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: theme.palette.onAccent,
  },
})
