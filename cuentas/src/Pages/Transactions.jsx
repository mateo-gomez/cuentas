import {
    DrawerLayoutAndroid,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native"
import StyledText from "../Components/StyledText"
import NumberFormat from "../Components/NumberFormat"
import TransactionList from "../Components/TransactionList"
import { useNavigate } from "react-router-native"
import PlusIcon from "../Components/svg/PlusIcon"
import { theme } from "../theme"
import MinusCircle from "../Components/svg/MinusCircle"
import AppBar from "../Components/AppBar"
import { useEffect, useRef, useState } from "react"
import Constants from "expo-constants"
import OptionsSideBar from "../Components/OptionsSideBar"

const { apiUrl } = Constants.expoConfig.extra

const Transactions = () => {
    const navigate = useNavigate()
    const drawerRef = useRef(null)

    const [summaryTransactions, setTransactions] = useState([])

    useEffect(() => {
        const getTransactions = async () => {
            try {
                const response = await fetch(`${apiUrl}/transactions`)
                const data = await response.json()
                const transactions = data.map((item) => {
                    const date = new Date(item.date)
                    return {
                        ...item,
                        date: date,
                    }
                })

                setTransactions(transactions)
            } catch (error) {
                console.log(error.message)
            }
        }

        getTransactions()
    }, [])

    const handlePressPlusButton = () => {
        navigate("/transactions/income")
    }

    const handlePressMinusButton = () => {
        navigate("/transactions/outcome")
    }

    return (
        <View style={{ flex: 1 }}>
            <AppBar>
                <StyledText color={"white"} fontWeight="bold">
                    Cuentas App
                </StyledText>
            </AppBar>
            <DrawerLayoutAndroid
                ref={drawerRef}
                drawerPosition="right"
                drawerWidth={300}
                renderNavigationView={OptionsSideBar}
            >
                <View style={styles.center}>
                    <StyledText
                        fontWeight="bold"
                        color="primary"
                        fontSize="heading"
                    >
                        Mis Cuentas
                    </StyledText>

                    <NumberFormat value={20000} />
                    <NumberFormat value={200000} />
                </View>

                <View style={styles.list}>
                    <View style={styles.balance}>
                        <StyledText big bold>
                            Saldo:{" "}
                        </StyledText>
                        <NumberFormat big bold value={200000} />
                    </View>

                    <TransactionList transactions={summaryTransactions} />
                </View>
                <View style={styles.buttons}>
                    <TouchableOpacity onPress={handlePressMinusButton}>
                        <MinusCircle color={theme.colors.red} size={150} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handlePressPlusButton}>
                        <PlusIcon color={theme.colors.greenLight} size={150} />
                    </TouchableOpacity>
                </View>
            </DrawerLayoutAndroid>
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
        flex: 1,
    },
    buttons: {
        paddingVertical: 10,
        alignItems: "center",
        justifyContent: "space-around",
        flexDirection: "row",
    },
})

export default Transactions
