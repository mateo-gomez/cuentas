import { StyleSheet, View } from "react-native"
import { theme } from "../theme"
import { StyledText } from "./StyledText"
import { NumberFormat } from "./NumberFormat"
import { Link } from "react-router-native"
import { TransactionType } from "../../types"
import { Ionicons } from "@expo/vector-icons"

interface TransactionItemProps {
  id: string
  type: TransactionType
  description: string
  value: number
  categoryName: string
}

export const TransactionItem = ({
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
