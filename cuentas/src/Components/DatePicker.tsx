import { DateTimePickerAndroid } from "@react-native-community/datetimepicker"
import { StyleSheet, TouchableOpacity, View } from "react-native"
import { theme } from "../theme"
import { dateFormat } from "../utils"
// import CalendarIcon from "./svg/CalendarIcon"
import StyledText from "./StyledText"
import { Calendar } from "iconoir-react-native"

const DatePicker = ({ style, onChange, date, ...restOfProps }) => {
    const dateFormatted = dateFormat(date ?? new Date())

    const handleChangeDate = (ev, date) => {
        onChange(date)
    }

    const handlePress = () => {
        DateTimePickerAndroid.open({
            mode: "date",
            value: date,
            onChange: handleChangeDate,
        })
    }

    const datePickerStyles = [styles.datePickerWrapper, style]

    return (
        <TouchableOpacity onPress={handlePress}>
            <View {...restOfProps} style={datePickerStyles}>
                <Calendar
                    width={theme.fontSizes.subheading}
                    height={theme.fontSizes.subheading}
                    color={theme.colors.textPrimary}
                    style={{ marginRight: 5 }}
                />
                <StyledText fontSize="subheading" fontWeight="bold">
                    {dateFormatted}
                </StyledText>
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    pickerText: { marginLeft: 5 },
    datePickerWrapper: {
        justifyContent: "center",
        flexDirection: "row",
        alignItems: "center",
    },
})

export default DatePicker
