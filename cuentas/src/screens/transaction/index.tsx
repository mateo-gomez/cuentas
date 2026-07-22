import { useEffect, useState } from "react"
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import { formatDate } from "../../utils"
import { useTheme, useThemedStyles } from "../../theme/index"
import type { Theme } from "../../theme/index"
import { Outlet, useLocation, useNavigate, useParams } from "react-router"
import { Category, TransactionDTO } from "../../../types"
import { ErrorBanner, OverlayLoader } from "../../Components"
import { useAccounts, useTransaction } from "../../hooks"
import {
  createTransaction,
  getDefaultAccount,
  getFrequentCombos,
  updateTransaction,
} from "../../services"
import { createLogger } from "../../lib/logger"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import DateField from "../../Components/DateField/DateField"
import AmountInput from "../../Components/AmountInput/AmountInput"
import { Ionicons } from "@expo/vector-icons"
import CategoryChip from "../../Components/CategoryChip"
import AccountChip from "../../Components/AccountChip"

const logger = createLogger("Transaction")

const initialDate = new Date()

const Transaction = () => {
  const { theme } = useTheme()
  const styles = useThemedStyles(makeStyles)
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
      setSubmitError(
        error instanceof Error ? error.message : "Error al guardar",
      )
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

  // Set the category and commit in one shot, passing the id directly to avoid
  // reading the just-set (still stale) category state.
  const commitWithCategory = (selectedCategory: Category) => {
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

  const handleSelectCategory = (selectedCategory: Category) => {
    const hadCategory = !!category

    // Shortcut only for the brand-new create flow (no category yet): picking a
    // category IS the terminal action, so commit immediately. When a category
    // already exists (edit or suggestion chip), selecting one only changes the
    // value and returns to the numpad so the user confirms with Guardar.
    if (hadCategory) {
      setCategory(selectedCategory)
      navigate(-1)
      return
    }

    commitWithCategory(selectedCategory)
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

  const isDirty = (
    record: Record<string, unknown> | undefined,
    reference: Record<string, unknown>,
  ) => {
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

        {/* Commit lives on the numpad's primary button (thumb-reachable);
            this spacer keeps the type toggle visually centered. */}
        <View style={styles.headerSpacer} />
      </View>

      {loading ? <OverlayLoader message="Cargando registro..." /> : null}
      <ErrorBanner message={submitError} />

      {/* ── Amount ── */}
      <AmountInput
        value={transactionValue}
        onChange={setTransactionValue}
        hasError={errors.transactionValue}
      />

      {/* ── Description ── */}
      <TextInput
        placeholder="Descripción"
        placeholderTextColor={theme.palette.ink4}
        style={styles.descriptionInput}
        value={description}
        onChangeText={handleChangeDescription}
      />

      {/* ── Meta fields (category · date · account) ── */}
      <View style={styles.fields}>
        {/* Category */}
        <TouchableOpacity
          style={styles.field}
          onPress={() => navigate("categories")}
        >
          <Text style={styles.fieldLabel}>Categoría</Text>
          <View style={styles.fieldValue}>
            {currentCategory ? (
              <>
                <CategoryChip
                  size="sm"
                  categoryId={currentCategory._id}
                  name={currentCategory.name}
                  icon={currentCategory.icon}
                />
                <Text style={styles.fieldValueText} numberOfLines={1}>
                  {currentCategory.name}
                </Text>
              </>
            ) : (
              <Text
                style={[styles.fieldValueText, styles.fieldValuePlaceholder]}
              >
                Sin categoría
              </Text>
            )}
            <Ionicons
              name="chevron-forward"
              size={16}
              color={theme.palette.ink4}
            />
          </View>
        </TouchableOpacity>

        {/* Date */}
        <DateField
          style={styles.field}
          value={date}
          onChange={handleChangeDate}
        >
          <Text style={styles.fieldLabel}>Fecha</Text>
          <View style={styles.fieldValue}>
            <Ionicons
              name="calendar-outline"
              size={16}
              color={theme.palette.ink3}
            />
            <Text style={styles.fieldValueText} numberOfLines={1}>
              {formatDate(date)}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={theme.palette.ink4}
            />
          </View>
        </DateField>

        {/* Account */}
        <View style={[styles.field, styles.fieldLast]}>
          <Text style={styles.fieldLabel}>Cuenta</Text>
          <AccountChip accountId={accountId} onSelect={setAccountId} />
        </View>
      </View>

      {/* ── Nested route (NumPad / Categories) ── */}
      <View style={{ marginTop: 16 }}>
        <Outlet
          context={{
            handlePressNumpad,
            handleSelectCategory,
            commitWithCategory,
            handleSave,
            hasCategory: !!category,
            isValidTransactionValue,
            categoryId: category?._id,
            transactionValue,
          }}
        />
      </View>
    </View>
  )
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.palette.bg,
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
      color: theme.palette.ink3,
    },
    togglePill: {
      flexDirection: "row",
      borderRadius: 20,
      overflow: "hidden",
    },
    toggleOption: {
      paddingHorizontal: 16,
      paddingVertical: 6,
      backgroundColor: theme.palette.surface3,
      borderRadius: 20,
    },
    toggleOptionActive: {
      backgroundColor: theme.palette.accent,
    },
    toggleOptionText: {
      fontSize: 14,
      color: theme.palette.ink3,
    },
    toggleOptionTextActive: {
      color: theme.palette.onAccent,
    },
    headerSpacer: {
      minWidth: 64,
    },
    // Amount
    amountText: {
      fontFamily: theme.fonts.serif,
      fontSize: 64,
      color: theme.palette.ink,
      textAlign: "center",
      marginTop: 12,
      marginHorizontal: 16,
    },
    amountError: {
      color: theme.palette.neg,
    },
    // Description
    descriptionInput: {
      borderBottomWidth: 1,
      borderBottomColor: theme.palette.line,
      fontSize: 15,
      color: theme.palette.ink,
      paddingVertical: 8,
      marginHorizontal: 16,
      marginTop: 12,
    },
    // Meta fields — stacked full-width rows so long category/account names
    // never truncate or collide (previously a cramped 3-column row).
    fields: {
      marginHorizontal: 16,
      marginTop: 14,
      borderTopWidth: 1,
      borderTopColor: theme.palette.line,
    },
    field: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 12,
      gap: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.palette.line,
    },
    fieldLast: {
      borderBottomWidth: 0,
    },
    fieldLabel: {
      fontSize: 14,
      color: theme.palette.ink3,
    },
    fieldValue: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      flexShrink: 1,
    },
    fieldValueText: {
      fontSize: 14,
      color: theme.palette.ink,
      flexShrink: 1,
    },
    fieldValuePlaceholder: {
      color: theme.palette.ink4,
    },
  })

export default Transaction
