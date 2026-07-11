import { useEffect, useState } from "react"
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import grafito from "../../theme"
import { formatNumber } from "../../utils"
import { Outlet, useNavigate, useParams } from "react-router-native"
import { Category, TransactionDTO } from "../../../types"
import {
  ErrorBanner,
  OverlayLoader,
} from "../../Components"
import { useTransaction } from "../../hooks"
import { createTransaction, updateTransaction } from "../../services"
import { createLogger } from "../../lib/logger"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker"
import { Ionicons } from "@expo/vector-icons"
import { formatDate } from "../../utils"
import CategoryChip from "../../Components/CategoryChip"

const logger = createLogger("Transaction")

const initialDate = new Date()

const Transaction = () => {
  const { type, id } = useParams()
  const navigate = useNavigate()
  const insets = useSafeAreaInsets()
  const { transaction, loading } = useTransaction(id)
  const [transactionValue, setTransactionValue] = useState(0)
  const [description, setDescription] = useState("")
  const [date, setDate] = useState(initialDate)
  const [submitError, setSubmitError] = useState("")
  const [transactionType, setTransactionType] = useState<"expense" | "income">(
    type === "income" ? "income" : "expense",
  )
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
    setSubmitError("")
    try {
      if (transaction.id) {
        await updateTransaction(transaction)
      } else {
        await createTransaction(transaction)
      }

      navigate("/")
    } catch (error) {
      logger.error("Submit transaction failed", { error })
      setSubmitError(error instanceof Error ? error.message : "Error al guardar")
    }
  }

  const handleSave = () => {
    return handleSubmit({
      id,
      value: transactionValue,
      description,
      date,
      category: transaction?.category?._id,
      type: transactionType === "income" ? 1 : 0,
    })
  }

  const handleSelectCategory = (category: Category) => {
    handleSubmit({
      id,
      value: transactionValue,
      description,
      date,
      category: category._id,
      type: transactionType === "income" ? 1 : 0,
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

  const isDirty = (record: Record<string, unknown> | undefined, reference: Record<string, unknown>) => {
    if (!record) return false

    return Object.entries(reference).some(
      ([key, value]) => record[key] !== value,
    )
  }

  const handleBackPress = () => {
    const isTransactionDirty = isDirty(
      transaction as unknown as Record<string, unknown>,
      {
        value: transactionValue,
        description,
        date,
      },
    )
    if (isTransactionDirty) {
      handleSave()
    }
    navigate("/")
  }

  const handleOpenDatePicker = () => {
    DateTimePickerAndroid.open({
      mode: "date",
      value: date,
      onChange: (_ev, newDate) => {
        if (newDate) handleChangeDate(newDate)
      },
    })
  }

  const currentCategory = transaction?.category

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.ghostBtn}>
          <Text style={styles.ghostBtnText}>Cancelar</Text>
        </TouchableOpacity>

        {/* Type toggle pill */}
        <View style={styles.togglePill}>
          <TouchableOpacity
            style={[
              styles.toggleOption,
              transactionType === "expense" && styles.toggleOptionActive,
            ]}
            onPress={() => setTransactionType("expense")}
          >
            <Text
              style={[
                styles.toggleOptionText,
                transactionType === "expense" && styles.toggleOptionTextActive,
              ]}
            >
              Gasto
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleOption,
              transactionType === "income" && styles.toggleOptionActive,
            ]}
            onPress={() => setTransactionType("income")}
          >
            <Text
              style={[
                styles.toggleOptionText,
                transactionType === "income" && styles.toggleOptionTextActive,
              ]}
            >
              Ingreso
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Guardar</Text>
        </TouchableOpacity>
      </View>

      {loading ? <OverlayLoader message="Cargando registro..." /> : null}
      <ErrorBanner message={submitError} />

      {/* ── Amount display ── */}
      <Text style={[styles.amountText, errors.transactionValue && styles.amountError]}>
        {formatNumber(transactionValue)}
      </Text>

      {/* ── Description ── */}
      <TextInput
        placeholder="Descripción"
        placeholderTextColor={grafito.ink4}
        style={styles.descriptionInput}
        value={description}
        onChangeText={handleChangeDescription}
      />

      {/* ── Category + Date row ── */}
      <View style={styles.metaRow}>
        <TouchableOpacity style={styles.metaCol}>
          {currentCategory ? (
            <>
              <CategoryChip
                size="md"
                categoryId={currentCategory._id}
                name={currentCategory.name}
                icon={currentCategory.icon}
              />
              <Text style={styles.metaText}>{currentCategory.name}</Text>
            </>
          ) : (
            <Text style={[styles.metaText, { color: grafito.ink4 }]}>Sin categoría</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.metaCol} onPress={handleOpenDatePicker}>
          <Ionicons name="calendar-outline" size={16} color={grafito.ink3} />
          <Text style={[styles.metaText, { color: grafito.ink3 }]}>
            {formatDate(date)}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Nested route (NumPad / Categories) ── */}
      <View style={{ marginTop: 16 }}>
        <Outlet
          context={{
            handlePressNumpad,
            handleSelectCategory,
            isValidTransactionValue,
            categoryId: transaction?.category?._id,
          }}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: grafito.bg,
  },
  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  ghostBtn: {
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  ghostBtnText: {
    fontSize: 15,
    color: grafito.ink3,
  },
  togglePill: {
    flexDirection: "row",
    borderRadius: 20,
    overflow: "hidden",
  },
  toggleOption: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: grafito.surface3,
    borderRadius: 20,
  },
  toggleOptionActive: {
    backgroundColor: grafito.accent,
  },
  toggleOptionText: {
    fontSize: 14,
    color: grafito.ink3,
  },
  toggleOptionTextActive: {
    color: grafito.onAccent,
  },
  saveBtn: {
    backgroundColor: grafito.accent,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  saveBtnText: {
    color: grafito.onAccent,
    fontSize: 15,
  },
  // Amount
  amountText: {
    fontFamily: grafito.fonts.serif,
    fontSize: 64,
    color: grafito.ink,
    textAlign: "center",
    marginTop: 12,
    marginHorizontal: 16,
  },
  amountError: {
    color: grafito.neg,
  },
  // Description
  descriptionInput: {
    borderBottomWidth: 1,
    borderBottomColor: grafito.line,
    fontSize: 15,
    color: grafito.ink,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginTop: 12,
  },
  // Meta row
  metaRow: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 14,
    gap: 16,
  },
  metaCol: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  metaText: {
    fontSize: 14,
    color: grafito.ink2,
    marginLeft: 8,
  },
})

export default Transaction
