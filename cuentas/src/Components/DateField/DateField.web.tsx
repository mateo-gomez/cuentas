import { useRef } from "react"
import { View } from "react-native"
import type { DateFieldProps } from "./DateField.native"

const toISODate = (date: Date) => {
  const offset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - offset).toISOString().slice(0, 10)
}

// A native <input type="date"> exposes internal day/month/year segments, each a
// separate tab stop (3 tabs to cross it). To keep the field a single tab stop we
// focus a transparent <button> (Enter/Space opens the picker) and keep the real
// date input out of the tab order (tabIndex -1) purely to host showPicker() and
// emit changes. The focus ring is drawn on the wrapper via :focus-within.
const DateField = ({ value, onChange, style, children }: DateFieldProps) => {
  const inputRef = useRef<HTMLInputElement>(null)

  const openPicker = () => {
    const el = inputRef.current
    if (!el) return
    if (typeof el.showPicker === "function") {
      try {
        el.showPicker()
      } catch {
        el.click()
      }
    } else {
      el.click()
    }
  }

  return (
    <View
      // @ts-expect-error dataSet is a react-native-web prop (renders data-* attrs)
      dataSet={{ a11yField: "date" }}
      style={[style, { position: "relative" }]}
    >
      {children}
      <button
        type="button"
        aria-label="Fecha"
        onClick={openPicker}
        onKeyDown={(ev) => {
          if (ev.key === "Enter" || ev.key === " ") {
            ev.preventDefault()
            openPicker()
          }
        }}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: 0,
          border: "none",
          background: "transparent",
          cursor: "pointer",
        }}
      />
      <input
        ref={inputRef}
        type="date"
        tabIndex={-1}
        aria-hidden
        value={toISODate(value)}
        onChange={(ev) => {
          if (!ev.target.value) return
          const [year, month, day] = ev.target.value.split("-").map(Number)
          onChange(new Date(year, month - 1, day))
        }}
        style={{
          position: "absolute",
          bottom: 0,
          left: "50%",
          width: 1,
          height: 1,
          opacity: 0,
          border: "none",
          pointerEvents: "none",
        }}
      />
    </View>
  )
}

export default DateField
