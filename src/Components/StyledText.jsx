import { StyleSheet, Text } from "react-native"
import { theme } from "../theme"

const styles = StyleSheet.create({
    text: {
        fontSize: theme.fontSizes.normal,
        color: theme.colors.grey,
    },
    bold: { fontWeight: theme.fontWeights.bold },
    big: { fontSize: theme.fontSizes.big },
    small: { fontSize: theme.fontSizes.small },
    primary: { color: theme.colors.primary },
    secondary: { color: theme.colors.secondary },
    greenLight: { color: theme.colors.greenLight },
    grey: { color: theme.colors.grey },
    red: { color: theme.colors.red },
})

export default function StyledText({
    children,
    bold,
    big,
    small,
    primary,
    secondary,
    greenLight,
    grey,
    red,
}) {
    const textStyles = [
        styles.text,
        bold && styles.bold,
        big && styles.big,
        small && styles.small,
        primary && styles.primary,
        secondary && styles.secondary,
        greenLight && styles.greenLight,
        grey && styles.grey,
        red && styles.red,
    ]

    return <Text style={textStyles}>{children}</Text>
}
