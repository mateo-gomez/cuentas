import { ArrowDownCircle, ArrowUpCircle } from "iconoir-react-native"
import { StyleSheet, View } from "react-native"
import { theme } from "../theme"
import NumberFormat from "./NumberFormat"
import StyledText from "./StyledText"

const TransactionItem = (props) => {
  return (
    <View style={styles.container}>
      <View>
        {props.type ? (
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
        <StyledText>{props.category.name}</StyledText>
        {props.description ? (
          <StyledText fontSize="small" color="grey">
            {props.description}
          </StyledText>
        ) : null}
      </View>
      <View style={styles.price}>
        <NumberFormat fontWeight="normal" value={props.value} />
      </View>
    </View>
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
