import { Text, TextProps } from "react-native"
import { useThemedStyles } from "../theme/index"
import type { Theme } from "../theme/index"
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
  fontSize?: "subheading" | "heading" | "small" | "body"
  fontWeight?: FontWeight | string
  color?: "primary" | "secondary" | "grey" | "green" | "red" | "white"
  textCenter?: boolean
}

const makeStyles = (theme: Theme) => ({
  text: {
    fontSize: 16,
    color: "#747E7E",
    fontFamily: theme.fonts.sans,
    textAlignVertical: "center" as const,
  },
  // Switch the family (Inter ships a real 700), never fake weight on top of
  // a 400 family — that produces faux-bold and looks muddy.
  bold: { fontFamily: theme.weight.bold },
  subheading: { fontSize: 20 },
  heading: { fontSize: 28 },
  small: { fontSize: 12 },
  body: { fontSize: 16 },
  colorPrimary: { color: "#747E7E" },
  colorSecondary: { color: theme.palette.accent },
  colorGreen: { color: theme.palette.pos },
  colorGrey: { color: "#9da7a7" },
  colorRed: { color: theme.palette.neg },
  colorWhite: { color: theme.palette.surface },
  textCenter: { textAlign: "center" as const },
})

export const StyledText = ({
  children,
  fontSize,
  fontWeight,
  color,
  textCenter,
  style,
  ...restOfProps
}: PropsWithChildren<StyledTextProps & TextProps>) => {
  const styles = useThemedStyles(makeStyles)
  const textStyles = [
    styles.text,
    fontWeight === "bold" && styles.bold,
    fontSize === "subheading" && styles.subheading,
    fontSize === "heading" && styles.heading,
    fontSize === "small" && styles.small,
    fontSize === "body" && styles.body,
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
