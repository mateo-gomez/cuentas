import { StyleSheet, View } from "react-native"
import cuentasData from "../data/cuentas"
import StyledText from "./StyledText"
import NumberFormat from "./NumberFormat"
import TransactionList from "./TransactionList"

const Transactions = () => {
    return (
        <View>
            <View style={styles.center}>
                <StyledText
                    fontWeight="bold"
                    color="primary"
                    fontSize="heading"
                >
                    Mis Cuentas
                </StyledText>

                <NumberFormat value={cuentasData.income} />
                <NumberFormat value={cuentasData.outcome} />
            </View>

            <View style={styles.list}>
                <View style={styles.balance}>
                    <StyledText big bold>
                        Saldo:{" "}
                    </StyledText>
                    <NumberFormat big bold value={cuentasData.balance} />
                </View>

                <TransactionList cuentas={cuentasData.bancolombia} />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    center: {
        alignItems: "center",
    },
    balance: {
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
    },
    list: {
        marginBottom: 10,
    },
})

export default Transactions
