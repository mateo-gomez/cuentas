import { View } from "react-native"
import { useTheme, useThemedStyles } from "../theme/index"
import type { Theme } from "../theme/index"
import { StyledText } from "./StyledText"
import { NumberFormat } from "./NumberFormat"
import Link from "../router/Link"
import { TransactionType } from "../../types"
import { Ionicons } from "@expo/vector-icons"

interface TransactionItemProps {
  id: string
  type: TransactionType
  description: string
  value: number
  categoryName: string
  isTransfer?: boolean
}

export const TransactionItem = ({
  id,
  type,
  description,
  value,
  categoryName,
  isTransfer,
}: TransactionItemProps) => {
  const { theme } = useTheme()
  const styles = useThemedStyles(makeStyles)
  return (
    <Link
      underlayColor={theme.palette.bg}
      to={`/transactions/${TransactionType[type]}/${id}`}
    >
      <View style={styles.container}>
        <View>
          {isTransfer ? (
            // Transfers (e.g. card payments) are neither income nor expense;
            // show a neutral swap icon so they don't read as a real gain/loss.
            <Ionicons
              name="swap-horizontal-outline"
              color={theme.palette.ink4}
              size={20}
            />
          ) : type ? (
            <Ionicons
              name="arrow-up-circle-outline"
              color={theme.palette.pos}
              size={20}
            />
          ) : (
            <Ionicons
              name="arrow-down-circle-outline"
              color={theme.palette.neg}
              size={20}
            />
          )}
        </View>
        <View style={styles.box}>
          <StyledText>{categoryName}</StyledText>
          {description ? (
            <StyledText fontSize="small" color="grey">
              {description}
            </StyledText>
          ) : null}
        </View>
        <View style={styles.price}>
          <NumberFormat fontWeight="normal" value={value} fontSize="small" />
        </View>
      </View>
    </Link>
  )
}

const makeStyles = (_theme: Theme) => ({
  container: {
    height: 50,
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
  },
  price: {
    alignItems: "flex-end" as const,
  },
  box: {
    flex: 1,
    paddingHorizontal: 10,
  },
})
