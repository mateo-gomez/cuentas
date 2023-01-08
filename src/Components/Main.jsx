import { StyleSheet, Text, View } from "react-native"
import Constants from "expo-constants"
import cuentasData from "../data/cuentas"
import CuentasList from "./TransactionList"
import StyledText from "./StyledText"
import NumberFormat from "./NumberFormat"

const Main = () => {
    return (
        <View style={styles.container}>
            <View style={styles.center}>
                <StyledText bold big greenDark>
                    Mis Cuentas
                </StyledText>

                <StyledText bold green>
                    {cuentasData.income}
                </StyledText>
                <StyledText bold red>
                    {cuentasData.outcome}
                </StyledText>
            </View>

            <View>
                <View style={styles.balance}>
                    <StyledText big bold>
                        Saldo:{" "}
                    </StyledText>
                    <NumberFormat big bold value={cuentasData.balance} />
                </View>

                <CuentasList cuentas={cuentasData.bancolombia} />
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
