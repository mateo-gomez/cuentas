import { useEffect, useState } from "react"
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native"
import { theme } from "../theme"
import { formatNumber } from "../utils"
import { Outlet, useNavigate, useParams } from "react-router-native"
import { client } from "../helpers"
import { Category, TransactionDTO } from "../../types"
import {
  AppBar,
  BackButton,
  StyledText,
  OverlayLoader,
  DatePicker,
} from "../Components"
import { useTransaction } from "../hooks"

const initialDate = new Date()

const createTransaction = async (newTransaction: TransactionDTO) => {
  return client.post("transactions", newTransaction)
}

const updateTransaction = async (transaction: TransactionDTO) => {
  return await client.put(`transactions/${transaction.id}`, transaction)
}

const Transaction = () => {
  const { type, id } = useParams()
  const navigate = useNavigate()
  const { transaction, loading } = useTransaction(id)
  const [transactionValue, setTransactionValue] = useState(0)
  const [description, setDescription] = useState("")
  const [date, setDate] = useState(initialDate)
  const [errors, setErrors] = useState({
    date: null,
    transactionValue: null,
    description: null,
  })

  useEffect(() => {
    if (transaction) {
      setTransactionValue(transaction.value)
      setDescription(transaction.description)
      setDate(transaction.date)
    }
  }, [transaction])

  const handlePressNumpad = (val: number) => {
    setTransactionValue(val)
  }

  const handleSubmit = async (transaction: TransactionDTO) => {
    try {
      if (transaction.id) {
        await updateTransaction(transaction)
      } else {
        await createTransaction(transaction)
      }

      navigate("/")
    } catch (error) {
      console.error("submit transaction error: ", error)
    }
  }

  const handleSave = () => {
    return handleSubmit({
      id,
      value: transactionValue,
      description,
      date,
      category: transaction.category._id,
      type: type === "income" ? 1 : 0,
    })
  }

  const handleSelectCategory = (category: Category) => {
    handleSubmit({
      id,
      value: transactionValue,
      description,
      date,
      category: category._id,
      type: type === "income" ? 1 : 0,
    })
  }

  const handleChangeDescription = (value: string) => {
    setDescription(value)
  }

  const handleChangeDate = (value: Date) => {
    setDate(value)
  }

  const isValidTransactionValue = () => {
    if (transactionValue) return true

    setErrors((errors) => ({ ...errors, transactionValue: true }))
  }

  const isDirty = (record, reference) => {
    if (!record) return false

    return Object.entries(reference).some(
      ([key, value]) => record[key] !== value,
    )
  }

  const handleBackPress = () => {
    const isTransactionDirty = isDirty(transaction, {
      value: transactionValue,
      description,
      date,
    })
    if (isTransactionDirty) {
      handleSave()
    }
  }

  useEffect(() => {
    if (errors.transactionValue && transactionValue) {
      setErrors((errors) => ({ ...errors, transactionValue: null }))
    }
  }, [transactionValue])

  return (
    <View style={{ flex: 1 }}>
      <AppBar style={{ justifyContent: "space-between", borderWidth: 1 }}>
        <View style={{ flexDirection: "row" }}>
          <BackButton onPress={handleBackPress} />

          <StyledText color={"white"} fontWeight="bold">
            {id ? "Editando " : " Nuevo "}
            {type === "income" ? "ingreso" : "gasto"}
          </StyledText>
        </View>

        <TouchableOpacity
          style={{
            padding: 8,
            borderRadius: 4,
            borderWidth: 1,
            borderColor: theme.colors.grey,
          }}
          onPress={handleSave}
        >
          <StyledText color="white">Guardar</StyledText>
        </TouchableOpacity>
      </AppBar>
      {loading ? <OverlayLoader message="Cargando registro..." /> : null}
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
              categoryId: transaction?.category._id,
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

export default Transaction
