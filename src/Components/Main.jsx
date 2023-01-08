import { StyleSheet, View } from "react-native"
import Constants from "expo-constants"
import cuentasData from "../data/cuentas"
import StyledText from "./StyledText"
import NumberFormat from "./NumberFormat"
import TransactionList from "./TransactionList"

const Main = () => {
    return (
        <View style={styles.container}>
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

            <View>
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
    container: {
        marginTop: Constants.statusBarHeight,
        flexGrow: 1,
    },
    center: {
        alignItems: "center",
    },
    balance: {
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
    },
})

export default Main
