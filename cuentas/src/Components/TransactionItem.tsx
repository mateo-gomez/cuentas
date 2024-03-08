import { ArrowDownCircle, ArrowUpCircle } from "iconoir-react-native"
import { StyleSheet, TouchableOpacity, View } from "react-native"
import { theme } from "../theme"
import NumberFormat from "./NumberFormat"
import StyledText from "./StyledText"
import { Link } from "react-router-native"
import { TransactionType } from "../../types/transaction"

interface TransactionItemProps {
  id: string
  type: TransactionType
  description: string
  value: number
  categoryName: string
}

const TransactionItem = ({
  id,
  type,
  description,
  value,
  categoryName,
}: TransactionItemProps) => {
  return (
    <Link
      underlayColor={theme.colors.highlight}
      to={`/transactions/${TransactionType[type]}/${id}`}
    >
      <View style={styles.container}>
        <View>
          {type ? (
            <ArrowUpCircle
              color={theme.colors.greenLight}
              height={20}
              width={20}
            />
          ) : (
            <ArrowDownCircle color={theme.colors.red} height={20} width={20} />
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
          <NumberFormat fontWeight="normal" value={value} />
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
    flex: 1,
    alignItems: "flex-end",
  },
  box: {
    marginLeft: 20,
    paddingHorizontal: 10,
  },
})

export default TransactionItem
