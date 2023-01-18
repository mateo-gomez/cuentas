import { DateTimePickerAndroid } from "@react-native-community/datetimepicker"
import { useState } from "react"
import { StyleSheet, TouchableOpacity, View } from "react-native"
import { theme } from "../theme"
import { locale } from "../utils"
import CalendarIcon from "./svg/CalendarIcon"
import StyledText from "./StyledText"

const DatePicker = () => {
    const [date, setDate] = useState(new Date())

    const deviceLanguage = locale().replace("_", "-").toLowerCase()

    const dateFormatted = date.toLocaleDateString(deviceLanguage, {
        day: "2-digit",
        weekday: "long",
        year: "numeric",
        month: "short",
    })

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

    return (
        <TouchableOpacity onPress={handlePress}>
            <View
                style={{
                    justifyContent: "center",
                    flexDirection: "row",
                    alignItems: "center",
                }}
            >
                <CalendarIcon
                    size={theme.fontSizes.subheading}
                    color={theme.colors.textPrimary}
                />
                <StyledText
                    style={{ marginLeft: 5 }}
                    fontSize="subheading"
                    fontWeight="bold"
                >
                    {dateFormatted}
                </StyledText>
            </View>
        </TouchableOpacity>
    )
}

export default DatePicker
