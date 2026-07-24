import { StyleProp, StyleSheet, Text, TextStyle } from "react-native"
import { formatNumber } from "../utils"

interface AmountTextProps {
  value: number
  style?: StyleProp<TextStyle>
  // Content rendered before the number (sign and/or currency symbol), e.g.
  // "$", "−$", "+$". The value itself is always formatted from its absolute.
  prefix?: string
  // Decimal size as a fraction of the base font size. Default 0.6.
  decimalRatio?: number
  numberOfLines?: number
  adjustsFontSizeToFit?: boolean
  selectable?: boolean
}

// Renders a currency amount with the decimals de-emphasized (smaller + faded).
// Decimals matter less than the integer part, and COP figures reach millions,
// so shrinking the fraction keeps the number compact and readable.
export const AmountText = ({
  value,
  style,
  prefix = "",
  decimalRatio = 0.6,
  numberOfLines,
  adjustsFontSizeToFit,
  selectable,
}: AmountTextProps) => {
  const flat = (StyleSheet.flatten(style) ?? {}) as TextStyle
  const baseSize = typeof flat.fontSize === "number" ? flat.fontSize : 15
  // es-CO uses "," as the decimal separator.
  const [integerPart, decimals] = formatNumber(Math.abs(value)).split(",")

  return (
    <Text
      style={style}
      numberOfLines={numberOfLines}
      adjustsFontSizeToFit={adjustsFontSizeToFit}
      selectable={selectable}
    >
      {prefix}
      {integerPart}
      {decimals ? (
        <Text
          style={{
            fontSize: Math.round(baseSize * decimalRatio),
            opacity: 0.6,
          }}
        >
          ,{decimals}
        </Text>
      ) : null}
    </Text>
  )
}
