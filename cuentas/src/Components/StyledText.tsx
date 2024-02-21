import { StyleSheet, Text } from "react-native"
import { theme } from "../theme"
import { PropsWithChildren } from "react"

export type FontWeight =
  | "bold"
  | "700"
  | "400"
  | "normal"
  | "100"
  | "200"
  | "300"
  | "500"
  | "600"
  | "800"
  | "900"

export interface StyledTextProps {
  fontSize?: "subheading" | "heading" | "small"
  fontWeight?: FontWeight | string
  color?: "primary" | "secondary" | "grey" | "green" | "red" | "white"
  textCenter?: boolean
  style?: StyleSheet.NamedStyles<any>
}

const styles = StyleSheet.create({
  text: {
    fontSize: theme.fontSizes.body,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.main,
    fontWeight: theme.fontWeights.normal as FontWeight,
    textAlignVertical: "center",
  },
  bold: { fontWeight: theme.fontWeights.bold as FontWeight },
  subheading: { fontSize: theme.fontSizes.subheading },
  heading: { fontSize: theme.fontSizes.heading },
  small: { fontSize: theme.fontSizes.small },
  body: { fontSize: theme.fontSizes.body },
  colorPrimary: { color: theme.colors.textPrimary },
  colorSecondary: { color: theme.colors.textSecondary },
  colorGreen: { color: theme.colors.greenLight },
  colorGrey: { color: theme.colors.grey },
  colorRed: { color: theme.colors.red },
  colorWhite: { color: theme.colors.white },
  textCenter: { textAlign: "center" },
})

export default function StyledText({
  children,
  fontSize,
  fontWeight,
  color,
  textCenter,
  style,
  ...restOfProps
}: PropsWithChildren<StyledTextProps>) {
  const textStyles = [
    styles.text,
    fontWeight === "bold" && styles.bold,
    fontSize === "subheading" && styles.subheading,
    fontSize === "heading" && styles.heading,
    fontSize === "small" && styles.small,
    color === "primary" && styles.colorPrimary,
    color === "secondary" && styles.colorSecondary,
    color === "grey" && styles.colorGrey,
    color === "green" && styles.colorGreen,
    color === "red" && styles.colorRed,
    color === "white" && styles.colorWhite,
    textCenter && styles.textCenter,
    style,
  ]

  return (
    <Text style={textStyles} {...restOfProps}>
      {children}
    </Text>
  )
}
