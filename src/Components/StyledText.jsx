import { StyleSheet, Text } from "react-native"
import { theme } from "../theme"

const styles = StyleSheet.create({
    text: {
        fontSize: theme.fontSizes.body,
        color: theme.colors.textPrimary,
        fontFamily: theme.fonts.main,
        fontWeight: theme.fontWeights.normal,
    },
    bold: { fontWeight: theme.fontWeights.bold },
    subheading: { fontSize: theme.fontSizes.subheading },
    heading: { fontSize: theme.fontSizes.heading },
    colorPrimary: { color: theme.colors.textPrimary },
    colorSecondary: { color: theme.colors.textSecondary },
    colorGreen: { color: theme.colors.greenLight },
    colorGrey: { color: theme.colors.grey },
    colorRed: { color: theme.colors.red },
})

export default function StyledText({
    children,
    fontSize,
    fontWeight,
    color,
    style,
    ...restOfProps
}) {
    const textStyles = [
        styles.text,
        fontWeight === "bold" && styles.bold,
        fontSize === "subheading" && styles.subheading,
        fontSize === "heading" && styles.heading,
        color === "primary" && styles.colorPrimary,
        color === "secondary" && styles.colorSecondary,
        color === "grey" && styles.colorGrey,
        color === "green" && styles.colorGreen,
        color === "red" && styles.colorRed,
    ]

    return (
        <Text style={StyleSheet.compose(textStyles, style)} {...restOfProps}>
            {children}
        </Text>
    )
}
