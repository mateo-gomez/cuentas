import type { ReactNode } from "react"
import { TouchableOpacity } from "react-native"
import type { StyleProp, ViewStyle } from "react-native"
import { openDatePicker } from "../../utils/openDatePicker"

export type DateFieldProps = {
  value: Date
  onChange: (date: Date) => void
  style?: StyleProp<ViewStyle>
  children: ReactNode
}

const DateField = ({ value, onChange, style, children }: DateFieldProps) => (
  <TouchableOpacity
    style={style}
    onPress={() => openDatePicker({ value, onChange })}
  >
    {children}
  </TouchableOpacity>
)

export default DateField
