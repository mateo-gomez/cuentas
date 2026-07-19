import { DateTimePickerAndroid } from "@react-native-community/datetimepicker"

export type OpenDatePickerArgs = {
  value: Date
  onChange: (date: Date) => void
}

export const openDatePicker = ({ value, onChange }: OpenDatePickerArgs) => {
  DateTimePickerAndroid.open({
    mode: "date",
    value,
    onChange: (_ev, newDate) => {
      if (newDate) onChange(newDate)
    },
  })
}
