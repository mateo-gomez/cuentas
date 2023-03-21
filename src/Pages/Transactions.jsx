import { StyleSheet, TouchableOpacity, View } from "react-native"
import StyledText from "../Components/StyledText"
import NumberFormat from "../Components/NumberFormat"
import TransactionList from "../Components/TransactionList"
import { useNavigate } from "react-router-native"
import PlusIcon from "../Components/svg/PlusIcon"
import { theme } from "../theme"
import MinusCircle from "../Components/svg/MinusCircle"
import AppBar from "../Components/AppBar"
import { useEffect, useState } from "react"

const initialSummaryTransactions = {
    income: 0,
    outcome: 0,
    balance: 0,
    accounts: [],
    transactions: [],
}

const Transactions = () => {
    const navigate = useNavigate()

    const [summaryTransactions, setSummaryTransactions] = useState(
        initialSummaryTransactions,
    )

    useEffect(() => {
        const getSummaryTransactions = async () => {
            try {
                const response = await fetch("http://192.168.20.40:8000/")
                const data = await response.json()
                const summary = data.map((item) => {
                    const date = new Date(item.date)
                    return {
                        ...item,
                        date: date,
                    }
                })

                setSummaryTransactions(summary)
            } catch (error) {
                console.log(error.message)
            }
        }

        getSummaryTransactions()
    }, [])

    const handlePressPlusButton = () => {
        navigate("/transactions/add")
    }

    const handlePressMinusButton = () => {
        navigate("/transactions/add")
    }

    return (
        <View style={{ flex: 1 }}>
            <AppBar title="Cuentas App" />

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

                <TransactionList cuentas={summaryTransactions} />
            </View>
            <View style={styles.buttons}>
                <TouchableOpacity onPress={handlePressMinusButton}>
                    <MinusCircle color={theme.colors.red} size={150} />
                </TouchableOpacity>
                <TouchableOpacity onPress={handlePressPlusButton}>
                    <PlusIcon color={theme.colors.greenLight} size={150} />
                </TouchableOpacity>
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
        flex: 1,
    },
    buttons: {
        paddingVertical: 20,
        alignItems: "center",
        justifyContent: "space-around",
        flexDirection: "row",
    },
})

export default Transactions
