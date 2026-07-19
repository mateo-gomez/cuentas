import { StyleSheet, Text } from "react-native"
import grafito from "../../theme"
import { formatNumber } from "../../utils"

export type AmountInputProps = {
  value: number
  onChange: (value: number) => void
  hasError?: boolean
}

// Native drives the amount through the on-screen numpad, so this is display-only.
const AmountInput = ({ value, hasError }: AmountInputProps) => (
  <Text style={[styles.amount, hasError && styles.amountError]}>
    {formatNumber(value)}
  </Text>
)

const styles = StyleSheet.create({
  amount: {
    fontFamily: grafito.fonts.serif,
    fontSize: 64,
    color: grafito.ink,
    textAlign: "center",
    marginTop: 12,
    marginHorizontal: 16,
  },
  amountError: {
    color: grafito.neg,
  },
})

export default AmountInput
