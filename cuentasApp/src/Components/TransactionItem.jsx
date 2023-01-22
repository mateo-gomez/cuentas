import { StyleSheet, Text, View } from "react-native"
import NumberFormat from "./NumberFormat"
import StyledText from "./StyledText"

const TransactionItem = (props) => {
    return (
        <View key={props.timestamp} style={styles.container}>
            <View>
                <Text>{props.type === "income" ? "⬆️" : "⬇️"}</Text>
            </View>
            <View style={styles.box}>
                <StyledText>{props.category}</StyledText>
                <StyledText>{props.description}</StyledText>
            </View>
            <View style={styles.price}>
                <NumberFormat value={props.value} />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    price: {
        flex: 1,
        paddingHorizontal: 10,
        alignItems: "flex-end",
    },
    box: {
        paddingHorizontal: 10,
    },
})

export default TransactionItem
