import { StyleSheet, Text } from "react-native"
import { theme } from "../theme"
import { formatNumber } from "../utils"

const NumberFormat = ({ value = 0, big, small, bold }) => {
    const numberStyles = [
        value < 0 ? styles.negative : styles.positive,
        small && styles.small,
        big && styles.big,
        bold && styles.bold,
    ]
    const formated = formatNumber(value)

    return <Text style={numberStyles}>{formated}</Text>
}

const styles = StyleSheet.create({
    bold: {
        fontWeight: theme.fontWeights.bold,
    },
    small: {
        fontSize: theme.fontSizes.small,
    },
    big: {
        fontSize: theme.fontSizes.big,
    },
    positive: {
        color: theme.colors.primary,
    },
    negative: {
        color: theme.colors.red,
    },
})

export default NumberFormat
