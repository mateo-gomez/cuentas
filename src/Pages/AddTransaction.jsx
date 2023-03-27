import { useEffect, useState } from "react"
import { BackHandler, StyleSheet, TextInput, View } from "react-native"
import AppBar from "../Components/AppBar"
import DatePicker from "../Components/DatePicker"
import { theme } from "../theme"
import { formatNumber } from "../utils"
import { Outlet, useNavigate, useParams } from "react-router-native"
import Constants from "expo-constants"

const initialDate = new Date()
const { apiUrl } = Constants.expoConfig.extra

const AddTransaction = () => {
    const [transactionValue, setTransactionValue] = useState(0)
    const [description, setDescription] = useState("")
    const [date, setDate] = useState(initialDate)
    const [errors, setErrors] = useState({
        date: null,
        transactionValue: null,
        description: null,
    })

    const { type } = useParams()
    const navigate = useNavigate()

    const handlePressNumpad = (val) => {
        setTransactionValue(val)
    }

    const handleSubmit = async (data) => {
        try {
            const response = await fetch(`${apiUrl}/transactions`, {
                method: "POST",
                headers: {
                    accept: "application/json",
                    "content-type": "application/json",
                },
                body: JSON.stringify(data),
            })

            const res = await response.json()

            console.log("res", res)
            navigate("/")
        } catch (error) {
            console.log(error)
        }
    }

    const handleSelectCategory = (category) => {
        handleSubmit({
            value: transactionValue,
            description,
            date,
            category: category.name,
            type: type === "income" ? 1 : 0,
        })
    }

    const handleChangeDescription = (value) => {
        setDescription(value)
    }

    const handleChangeDate = (value) => {
        setDate(value)
    }

    const isValidTransactionValue = () => {
        if (transactionValue) return true

        setErrors((errors) => ({ ...errors, transactionValue: true }))
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

    useEffect(() => {
        if (errors.transactionValue && transactionValue) {
            setErrors((errors) => ({ ...errors, transactionValue: null }))
        }
    }, [transactionValue])

    return (
        <View style={{ flex: 1 }}>
            <AppBar
                backButton
                title={type === "income" ? "Nuevo ingreso" : "Nuevo egreso"}
            />

            <View style={styles.wrapper}>
                <DatePicker
                    style={styles.datePicker}
                    date={date}
                    onChange={handleChangeDate}
                />

                <TextInput
                    placeholder="Descripción"
                    style={styles.description}
                    onChangeText={handleChangeDescription}
                />

                <TextInput
                    textAlign="center"
                    numberOfLines={1}
                    maxLength={20}
                    showSoftInputOnFocus={false}
                    caretHidden={true}
                    style={[
                        styles.transactionInput,
                        errors.transactionValue && styles.error,
                    ]}
                    value={formatNumber(transactionValue)}
                />

                <View style={{ marginTop: 20 }}>
                    <Outlet
                        context={{
                            handlePressNumpad,
                            handleSelectCategory,
                            isValidTransactionValue,
                        }}
                    />
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    transactionInput: {
        borderRadius: 10,
        borderColor: theme.colors.transparent,
        borderWidth: 2,
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
    error: {
        borderColor: theme.colors.red,
        borderWidth: 2,
    },
})

export default AddTransaction
