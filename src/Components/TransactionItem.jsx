import { StyleSheet, Text, View } from "react-native"
import NumberFormat from "./NumberFormat"
import StyledText from "./StyledText"

const TransactionItem = (props) => {
    return (
        <View style={styles.container}>
            <View>
                <Text>{props.type ? "⬆️" : "⬇️"}</Text>
            </View>
            <View style={styles.box}>
                <StyledText>{props.category}</StyledText>
                <StyledText color="grey">{props.description}</StyledText>
            </View>
            <View style={styles.price}>
                <NumberFormat
                    value={props.value}
                    color={props.type ? "green" : "red"}
                />
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
