import { useEffect, useRef, useState } from "react"
import { useTheme } from "../../theme/index"
import type { AmountInputProps } from "./AmountInput.native"

// Web makes the amount a real focusable field: first tab stop, keyboard-driven,
// so the whole create flow (amount → description → date → account → category)
// works without a mouse. The browser input handles decimal entry natively.
const AmountInput = ({ value, onChange, hasError }: AmountInputProps) => {
  const { theme } = useTheme()
  const ref = useRef<HTMLInputElement>(null)
  const [buffer, setBuffer] = useState(value ? String(value) : "")

  // Keep the buffer in sync when the value changes externally (e.g. seeded on
  // edit), but not while the field is focused and the user is mid-typing.
  useEffect(() => {
    if (document.activeElement !== ref.current) {
      setBuffer(value ? String(value) : "")
    }
  }, [value])

  // Autofocus so the user can type the amount immediately on open.
  useEffect(() => {
    ref.current?.focus()
  }, [])

  return (
    <input
      ref={ref}
      inputMode="decimal"
      aria-label="Monto"
      aria-invalid={hasError || undefined}
      placeholder="0"
      value={buffer}
      onChange={(ev) => {
        // Allow only digits and a single decimal separator.
        const raw = ev.target.value.replace(",", ".")
        if (!/^\d*\.?\d*$/.test(raw)) return
        setBuffer(raw)
        onChange(Number(raw) || 0)
      }}
      style={{
        fontFamily: theme.weight.bold,
        fontVariantNumeric: "tabular-nums",
        fontSize: 64,
        color: hasError ? theme.palette.neg : theme.palette.ink,
        textAlign: "center",
        marginTop: 12,
        marginLeft: 16,
        marginRight: 16,
        border: "none",
        outline: "none",
        background: "transparent",
        width: "calc(100% - 32px)",
      }}
    />
  )
}

export default AmountInput
