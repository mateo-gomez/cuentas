import { Text } from "react-native"
import { useTheme, useThemedStyles } from "../../theme/index"
import type { Theme } from "../../theme/index"
import { formatNumber } from "../../utils"

export type AmountInputProps = {
  value: number
  onChange: (value: number) => void
  hasError?: boolean
}

// Native drives the amount through the on-screen numpad, so this is display-only.
const AmountInput = ({ value, hasError }: AmountInputProps) => {
  const styles = useThemedStyles(makeStyles)
  return (
    <Text style={[styles.amount, hasError && styles.amountError]}>
      {formatNumber(value)}
    </Text>
  )
}

const makeStyles = (theme: Theme) => ({
  amount: {
    fontFamily: theme.weight.bold,
    ...theme.numeric,
    fontSize: 64,
    color: theme.palette.ink,
    textAlign: "center" as const,
    marginTop: 12,
    marginHorizontal: 16,
  },
  amountError: {
    color: theme.palette.neg,
  },
})

export default AmountInput
