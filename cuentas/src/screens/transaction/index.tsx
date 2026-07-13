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
import { Outlet, useLocation, useNavigate, useParams } from "react-router-native"
import { Category, TransactionDTO } from "../../../types"
import {
  ErrorBanner,
  OverlayLoader,
} from "../../Components"
import { useAccounts, useTransaction } from "../../hooks"
import { createTransaction, getDefaultAccount, getFrequentCombos, updateTransaction } from "../../services"
import { createLogger } from "../../lib/logger"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker"
import { Ionicons } from "@expo/vector-icons"
import { formatDate } from "../../utils"
import CategoryChip from "../../Components/CategoryChip"
import AccountChip from "../../Components/AccountChip"

const logger = createLogger("Transaction")

const initialDate = new Date()

const Transaction = () => {
  const { type, id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const insets = useSafeAreaInsets()
  const { transaction, loading } = useTransaction(id)
  const navState = (location.state ?? {}) as {
    accountId?: string
    category?: Category
    description?: string
  }
  const { accounts } = useAccounts()
  const [transactionValue, setTransactionValue] = useState(0)
  const [description, setDescription] = useState(navState.description ?? "")
  const [date, setDate] = useState(initialDate)
  const [submitError, setSubmitError] = useState("")
  const [accountId, setAccountId] = useState<string | undefined>(
    navState.accountId,
  )
  const [category, setCategory] = useState<Category | undefined>(
    navState.category,
  )
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
      if (transaction.accountId) {
        setAccountId(transaction.accountId)
      }
      if (transaction.category) {
        setCategory(transaction.category)
      }
    }
  }, [transaction])

  // Smart defaults (R4): only for the create flow — editing an existing
  // transaction is fully driven by `transaction` above. Account resolution
  // order: nav state (Home's active account) -> the user's server-side default
  // account (GET /accounts/default) -> first available account -> require the
  // picker. Category defaults to the resolved account's most-used category;
  // empty history stays a safe empty state.
  useEffect(() => {
    if (id) return // editing — no smart defaults
    if (accountId) return
    if (accounts.length === 0) return

    let cancelled = false

    getDefaultAccount()
      .then((defaultAccount) => {
        if (cancelled) return
        setAccountId(defaultAccount?._id ?? accounts[0]._id)
      })
      .catch(() => {
        // Endpoint unreachable: fall back to the first account so the create
        // screen still resolves an account instead of forcing the picker.
        if (cancelled) return
        setAccountId(accounts[0]._id)
      })

    return () => {
      cancelled = true
    }
  }, [id, accountId, accounts])

  useEffect(() => {
    if (id) return
    if (category) return
    if (!accountId) return

    let cancelled = false

    getFrequentCombos({ accountId, limit: 1 })
      .then((combos) => {
        if (cancelled || combos.length === 0) return
        setCategory(combos[0].category as unknown as Category)
      })
      .catch(() => {
        // New user / empty history: stay in the neutral "Sin categoría"
        // state, never crash the create screen.
      })

    return () => {
      cancelled = true
    }
  }, [id, accountId, category])

  const handlePressNumpad = (val: number) => {
    setTransactionValue(val)
  }

  const handleSubmit = async (transaction: TransactionDTO) => {
    setSubmitError("")

    if (!transaction.accountId) {
      setSubmitError("Elegí una cuenta antes de guardar")
      return
    }

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
      category: category?._id,
      type: transactionType === "income" ? 1 : 0,
      accountId: accountId ?? "",
    })
  }

  const handleSelectCategory = (selectedCategory: Category) => {
    setCategory(selectedCategory)
    handleSubmit({
      id,
      value: transactionValue,
      description,
      date,
      category: selectedCategory._id,
      type: transactionType === "income" ? 1 : 0,
      accountId: accountId ?? "",
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

  const currentCategory = category

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

        <View style={styles.metaCol}>
          <AccountChip accountId={accountId} onSelect={setAccountId} />
        </View>
      </View>

      {/* ── Nested route (NumPad / Categories) ── */}
      <View style={{ marginTop: 16 }}>
        <Outlet
          context={{
            handlePressNumpad,
            handleSelectCategory,
            isValidTransactionValue,
            categoryId: category?._id,
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
