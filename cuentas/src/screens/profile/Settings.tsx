import { Ionicons } from "@expo/vector-icons"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { useNavigate } from "react-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useTheme, useThemedStyles } from "../../theme/index"
import type { Theme } from "../../theme/index"
import { Screen } from "../../Components"
import { LogoutOption } from "../../Components/LogoutOption"
import { AppVersion } from "../../Components/AppVersion"
import BottomTabBar from "../../Components/BottomTabBar"
import { useTabBar } from "../../hooks"
import { useConfirm } from "../../contexts/ConfirmContext"
import { notify } from "../../utils/notify"
import { resetAllTransactions } from "../../services"
import { createLogger } from "../../lib/logger"

const logger = createLogger("Settings")

// Migrated from the removed OptionsSideBar drawer (settings hub — design §3d).
const navigationOptions = [
  {
    title: "Perfil",
    icon: "person-outline" as const,
    to: "/settings/profile",
  },
  {
    title: "Categorías",
    icon: "grid-outline" as const,
    to: "/categories",
  },
  {
    title: "Importar transacciones",
    icon: "cloud-upload-outline" as const,
    to: "/import",
  },
  {
    title: "Cuentas",
    icon: "wallet-outline" as const,
    to: "/accounts",
  },
  {
    title: "Tema",
    icon: "color-palette-outline" as const,
    to: "/settings/theme",
  },
]

// Non-functional placeholders — out of scope per spec non-goals.
const inertOptions = [
  { title: "Moneda", icon: "cash-outline" as const },
  { title: "Notificaciones", icon: "notifications-outline" as const },
]

const Settings = () => {
  const { theme } = useTheme()
  const styles = useThemedStyles(makeStyles)
  const navigate = useNavigate()
  const insets = useSafeAreaInsets()
  const tabBar = useTabBar()
  const confirm = useConfirm()

  const handleResetData = async () => {
    const ok = await confirm({
      title: "Eliminar todos los datos",
      message:
        "Se eliminarán TODAS tus transacciones y empezarás de cero. Tus cuentas y categorías se conservan (quedarán en saldo 0). Esta acción no se puede deshacer.",
      confirmText: "Eliminar todo",
      destructive: true,
    })
    if (!ok) return

    try {
      await resetAllTransactions()
      notify.success("Datos eliminados", "Empezás de cero")
      navigate("/")
    } catch (error) {
      logger.error("Reset data failed", { message: error.message })
      notify.error("No se pudieron eliminar los datos")
    }
  }

  return (
    <Screen style={{ paddingTop: insets.top }}>
      <View style={styles.header}>
        <Text style={styles.title}>Configuración</Text>
      </View>

      <View style={styles.list}>
        {navigationOptions.map((option) => (
          <TouchableOpacity
            key={option.title}
            style={styles.row}
            onPress={() => navigate(option.to)}
          >
            <Ionicons
              name={option.icon}
              size={20}
              color={theme.palette.accent}
            />
            <Text style={styles.rowLabel}>{option.title}</Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={theme.palette.ink4}
            />
          </TouchableOpacity>
        ))}

        {inertOptions.map((option) => (
          <View key={option.title} style={[styles.row, styles.rowDisabled]}>
            <Ionicons name={option.icon} size={20} color={theme.palette.ink4} />
            <Text style={[styles.rowLabel, styles.rowLabelDisabled]}>
              {option.title}
            </Text>
            <Text style={styles.comingSoon}>Próximamente</Text>
          </View>
        ))}

        <TouchableOpacity style={styles.row} onPress={handleResetData}>
          <Ionicons name="trash-outline" size={20} color={theme.palette.neg} />
          <Text style={[styles.rowLabel, styles.rowLabelDanger]}>
            Eliminar todos los datos
          </Text>
        </TouchableOpacity>
      </View>

      <LogoutOption />
      <AppVersion />

      <View style={styles.spacer} />

      <BottomTabBar {...tabBar} />
    </Screen>
  )
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 8,
    },
    title: {
      fontFamily: theme.fonts.serif,
      fontSize: 22,
      color: theme.palette.ink,
    },
    spacer: {
      flex: 1,
    },
    list: {
      paddingHorizontal: 20,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: theme.palette.line2,
    },
    rowLabel: {
      flex: 1,
      fontFamily: theme.fonts.sans,
      fontSize: 15,
      color: theme.palette.ink,
    },
    rowDisabled: {
      opacity: 0.6,
    },
    rowLabelDisabled: {
      color: theme.palette.ink4,
    },
    rowLabelDanger: {
      color: theme.palette.neg,
    },
    comingSoon: {
      fontFamily: theme.fonts.sans,
      fontSize: 11,
      color: theme.palette.ink4,
    },
  })

export default Settings
