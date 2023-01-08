import { StyleSheet, Text, View } from "react-native"

const TransactionItem = (props) => {
    return (
        <View key={props.timestamp} style={styles.container}>
            <View>
                <Text style={styles.box}>{props.type}</Text>
            </View>
            <View style={styles.box}>
                <Text>{props.category}</Text>
                <Text>{props.description}</Text>
            </View>
            <View style={styles.price}>
                <Text>{props.value}</Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
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
