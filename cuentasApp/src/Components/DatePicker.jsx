import { DateTimePickerAndroid } from "@react-native-community/datetimepicker"
import { useState } from "react"
import { StyleSheet, TouchableOpacity, View } from "react-native"
import { theme } from "../theme"
import { dateFormat } from "../utils"
import CalendarIcon from "./svg/CalendarIcon"
import StyledText from "./StyledText"

const DatePicker = ({ style, ...restOfProps }) => {
    const [date, setDate] = useState(new Date())

    const dateFormatted = dateFormat(date)

    const handleChangeDate = (ev, date) => {
        setDate(() => date)
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
                <CalendarIcon
                    size={theme.fontSizes.subheading}
                    color={theme.colors.textPrimary}
                />
                <StyledText
                    style={styles.pickerText}
                    fontSize="subheading"
                    fontWeight="bold"
                >
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
