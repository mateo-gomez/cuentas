import { useEffect, useRef, useState } from "react"
import { BackHandler, StyleSheet, TextInput, View } from "react-native"
import AppBar from "../Components/AppBar"
import DatePicker from "../Components/DatePicker"
import { theme } from "../theme"
import { formatNumber } from "../utils"
import { Outlet, useNavigate } from "react-router-native"

const AddTransaction = () => {
    const inputValueRef = useRef(null)
    const inputDescriptionRef = useRef("")

    const [transactionValue, setTransactionValue] = useState(formatNumber(0))

    const navigate = useNavigate()

    const handlePressNumpad = (val) => {
        const formated = formatNumber(val)

        setTransactionValue(formated)
    }

    useEffect(() => {
        const onBackPress = () => {
            navigate(-1)

            return true
        }

        BackHandler.addEventListener("hardwareBackPress", onBackPress)

        return () => {
            BackHandler.removeEventListener("hardwareBackPress", onBackPress)
        }
    }, [])

    return (
        <View style={{ flex: 1 }}>
            <AppBar backButton title="Nuevo ingreso" />

            <View style={styles.wrapper}>
                <DatePicker style={styles.datePicker} />

                <TextInput
                    placeholder="Descripción"
                    style={styles.description}
                />

                <TextInput
                    ref={inputValueRef}
                    textAlign="center"
                    numberOfLines={1}
                    maxLength={20}
                    showSoftInputOnFocus={false}
                    caretHidden={true}
                    style={styles.transactionInput}
                    value={transactionValue}
                />

                <View style={{ marginTop: 20 }}>
                    <Outlet context={{ handlePressNumpad }} />
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    transactionInput: {
        borderRadius: 10,
        backgroundColor: theme.colors.primary,
        color: theme.colors.white,
        padding: 10,
        fontSize: theme.fontSizes.heading * 1.5,
        marginTop: 20,
    },
    description: {
        borderStyle: "solid",
        borderColor: theme.colors.primary,
        borderBottomWidth: 1,
        padding: 10,
        fontSize: theme.fontSizes.body,
        marginTop: 10,
    },
    datePicker: { padding: 10, marginTop: 10 },
    wrapper: { flex: 1, margin: 20 },
})

export default AddTransaction
