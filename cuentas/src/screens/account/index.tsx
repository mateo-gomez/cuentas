import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import grafito from "../../theme"
import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-native"
import { Ionicons } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { AccountType } from "../../../types"
import { useAccount } from "../../hooks"
import { createAccount, deleteAccount, updateAccount } from "../../services"
import { createLogger } from "../../lib/logger"

const logger = createLogger("Account")

const Account = () => {
  const navigate = useNavigate()
  const insets = useSafeAreaInsets()
  const { id } = useParams()
  const { account, loading, error } = useAccount(id)

  const [name, setName] = useState("")
  const [type, setType] = useState<AccountType>("bank")
  const [openingBalance, setOpeningBalance] = useState("0")
  const [cutoffDay, setCutoffDay] = useState("")
  const [dueDay, setDueDay] = useState("")
  const [errors, setErrors] = useState({
    name: null,
    cutoffDay: null,
    dueDay: null,
  })

  useEffect(() => {
    if (account) {
      setName(account.name)
      setType(account.type)
      setOpeningBalance(String(account.openingBalance))
      setCutoffDay(account.cutoffDay ? String(account.cutoffDay) : "")
      setDueDay(account.dueDay ? String(account.dueDay) : "")
    }
  }, [account])

  const handleSubmit = async () => {
    const isCredit = type === "credit"
    const cutoffDayValid = !isCredit || (cutoffDay && Number(cutoffDay) >= 1 && Number(cutoffDay) <= 31)
    const dueDayValid = !isCredit || (dueDay && Number(dueDay) >= 1 && Number(dueDay) <= 31)

    if (!name || !cutoffDayValid || !dueDayValid) {
      setErrors({
        name: !name ? "Nombre inválido" : null,
        cutoffDay: !cutoffDayValid ? "Día de cierre inválido (1-31)" : null,
        dueDay: !dueDayValid ? "Día de vencimiento inválido (1-31)" : null,
      })
      return
    }

    const accountData = {
      name,
      type,
      openingBalance: Number(openingBalance) || 0,
      ...(isCredit
        ? { cutoffDay: Number(cutoffDay), dueDay: Number(dueDay) }
        : {}),
    }

    try {
      if (id) {
        await updateAccount(id, accountData)
      } else {
        await createAccount(accountData)
      }

      navigate("/accounts")
    } catch (error) {
      logger.error("Submit account failed", { message: error.message })

      if (error.errors) {
        setErrors(error.errors)
      }
    }
  }

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount(id)

      navigate("/accounts")
    } catch (error) {
      throw error
    }
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigate(-1)}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="chevron-back" size={26} color={grafito.ink} />
        </TouchableOpacity>

        <Text style={styles.title} numberOfLines={1}>
          {id ? "Editar cuenta" : "Nueva cuenta"}
        </Text>

        <View style={styles.actions}>
          {id ? (
            <TouchableOpacity
              onPress={handleDeleteAccount}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons name="trash-outline" size={22} color={grafito.ink3} />
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity style={styles.savePill} onPress={handleSubmit}>
            <Text style={styles.savePillText}>{id ? "Guardar" : "Añadir"}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <View style={styles.container}>
        {error ? (
          <Text style={styles.message}>
            Ha ocurrido un error al cargar la cuenta
          </Text>
        ) : null}

        {loading ? <Text style={styles.message}>Cargando...</Text> : null}

        <TextInput
          textAlign="center"
          numberOfLines={1}
          maxLength={30}
          placeholder="Nombre"
          placeholderTextColor={grafito.ink5}
          style={[styles.nameInput, errors.name && styles.error]}
          onChangeText={setName}
          value={name}
        />

        {/* Type toggle */}
        <View style={styles.typeToggle}>
          <TouchableOpacity
            style={[styles.typeOption, type === "bank" && styles.typeOptionActive]}
            onPress={() => setType("bank")}
          >
            <Text
              style={[
                styles.typeOptionText,
                type === "bank" && styles.typeOptionTextActive,
              ]}
            >
              Cuenta bancaria
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeOption, type === "credit" && styles.typeOptionActive]}
            onPress={() => setType("credit")}
          >
            <Text
              style={[
                styles.typeOptionText,
                type === "credit" && styles.typeOptionTextActive,
              ]}
            >
              Tarjeta de crédito
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Saldo inicial</Text>
          <TextInput
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={grafito.ink5}
            style={styles.input}
            onChangeText={setOpeningBalance}
            value={openingBalance}
          />
        </View>

        {type === "credit" ? (
          <>
            <View style={styles.field}>
              <Text style={styles.label}>Día de cierre</Text>
              <TextInput
                keyboardType="numeric"
                maxLength={2}
                placeholder="1-31"
                placeholderTextColor={grafito.ink5}
                style={[styles.input, errors.cutoffDay && styles.error]}
                onChangeText={setCutoffDay}
                value={cutoffDay}
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Día de vencimiento</Text>
              <TextInput
                keyboardType="numeric"
                maxLength={2}
                placeholder="1-31"
                placeholderTextColor={grafito.ink5}
                style={[styles.input, errors.dueDay && styles.error]}
                onChangeText={setDueDay}
                value={dueDay}
              />
            </View>
          </>
        ) : null}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: grafito.bg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 12,
  },
  title: {
    flex: 1,
    fontFamily: grafito.fonts.serif,
    fontSize: 20,
    color: grafito.ink,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  savePill: {
    backgroundColor: grafito.accent,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  savePillText: {
    fontFamily: grafito.fonts.sans,
    fontSize: 15,
    fontWeight: "600",
    color: grafito.onAccent,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  nameInput: {
    backgroundColor: grafito.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: grafito.line,
    color: grafito.ink,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontFamily: grafito.fonts.serif,
    fontSize: 24,
    marginVertical: 20,
  },
  error: {
    borderColor: grafito.neg,
  },
  message: {
    fontFamily: grafito.fonts.sans,
    fontSize: 14,
    color: grafito.ink3,
    textAlign: "center",
    marginBottom: 12,
  },
  typeToggle: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  typeOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: grafito.line,
    alignItems: "center",
  },
  typeOptionActive: {
    backgroundColor: grafito.accent,
    borderColor: grafito.accent,
  },
  typeOptionText: {
    fontFamily: grafito.fonts.sans,
    fontSize: 14,
    color: grafito.ink3,
  },
  typeOptionTextActive: {
    color: grafito.onAccent,
    fontWeight: "600",
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontFamily: grafito.fonts.sans,
    fontSize: 13,
    color: grafito.ink3,
    marginBottom: 6,
  },
  input: {
    backgroundColor: grafito.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: grafito.line,
    color: grafito.ink,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: grafito.fonts.sans,
    fontSize: 15,
  },
})

export default Account
