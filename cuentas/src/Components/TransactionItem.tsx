import { StyleSheet, View } from "react-native"
import { theme } from "../theme"
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
  return (
    <Link
      underlayColor={theme.colors.highlight}
      to={`/transactions/${TransactionType[type]}/${id}`}
    >
      <View style={styles.container}>
        <View>
          {isTransfer ? (
            // Transfers (e.g. card payments) are neither income nor expense;
            // show a neutral swap icon so they don't read as a real gain/loss.
            <Ionicons
              name="swap-horizontal-outline"
              color={theme.colors.grey}
              size={20}
            />
          ) : type ? (
            <Ionicons
              name="arrow-up-circle-outline"
              color={theme.colors.greenLight}
              size={20}
            />
          ) : (
            <Ionicons
              name="arrow-down-circle-outline"
              color={theme.colors.red}
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

const styles = StyleSheet.create({
  container: {
    height: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  price: {
    alignItems: "flex-end",
  },
  box: {
    flex: 1,
    paddingHorizontal: 10,
  },
})
