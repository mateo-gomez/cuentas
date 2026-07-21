import { openDatePicker } from "../utils/openDatePicker"
import { TouchableOpacity, View } from "react-native"
import { useTheme, useThemedStyles } from "../theme/index"
import type { Theme } from "../theme/index"
import { formatDate } from "../utils"
import { StyledText } from "./StyledText"
import { Ionicons } from "@expo/vector-icons"

export const DatePicker = ({ style, onChange, date, ...restOfProps }) => {
  const { theme } = useTheme()
  const styles = useThemedStyles(makeStyles)
  const dateFormatted = formatDate(date ?? new Date())

  const handlePress = () => {
    openDatePicker({ value: date ?? new Date(), onChange })
  }

  const datePickerStyles = [styles.datePickerWrapper, style]

  return (
    <TouchableOpacity onPress={handlePress}>
      <View {...restOfProps} style={datePickerStyles}>
        <Ionicons
          name="calendar-clear-outline"
          size={20}
          color={theme.palette.ink}
          style={{ marginRight: 5 }}
        />
        <StyledText fontSize="subheading" fontWeight="bold">
          {dateFormatted}
        </StyledText>
      </View>
    </TouchableOpacity>
  )
}

const makeStyles = (_theme: Theme) => ({
  pickerText: { marginLeft: 5 },
  datePickerWrapper: {
    justifyContent: "center" as const,
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
})
