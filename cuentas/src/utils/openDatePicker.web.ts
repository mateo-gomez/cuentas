import type { OpenDatePickerArgs } from "./openDatePicker.native"

const toISODate = (date: Date) => {
  const offset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - offset).toISOString().slice(0, 10)
}

// showPicker() anchors the calendar to the input's box, so track the last
// pointer position and place the (invisible) input there.
const lastPointer = { x: 0, y: 0 }
if (typeof window !== "undefined") {
  window.addEventListener(
    "pointerdown",
    (ev) => {
      lastPointer.x = ev.clientX
      lastPointer.y = ev.clientY
    },
    true,
  )
}

// Web has no native datetimepicker; drive the browser's own date input.
export const openDatePicker = ({ value, onChange }: OpenDatePickerArgs) => {
  const input = document.createElement("input")
  input.type = "date"
  input.value = toISODate(value)
  input.style.position = "fixed"
  input.style.left = `${lastPointer.x}px`
  input.style.top = `${lastPointer.y}px`
  input.style.width = "1px"
  input.style.height = "1px"
  input.style.opacity = "0"
  input.style.border = "none"
  input.style.padding = "0"
  input.style.pointerEvents = "none"
  document.body.appendChild(input)

  const cleanup = () => input.remove()

  input.addEventListener("change", () => {
    if (input.value) {
      // Parse as local time to avoid the UTC off-by-one day shift.
      const [year, month, day] = input.value.split("-").map(Number)
      onChange(new Date(year, month - 1, day))
    }
    cleanup()
  })
  input.addEventListener("blur", cleanup)

  if (typeof input.showPicker === "function") input.showPicker()
  else input.click()
}
