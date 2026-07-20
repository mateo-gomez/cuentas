import { Ionicons } from "@expo/vector-icons"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { useNavigate } from "react-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import grafito from "../../theme"
import { LogoutOption } from "../../Components/LogoutOption"
import { AppVersion } from "../../Components/AppVersion"
import BottomTabBar from "../../Components/BottomTabBar"
import { useTabBar } from "../../hooks"

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
  const navigate = useNavigate()
  const insets = useSafeAreaInsets()
  const tabBar = useTabBar()

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
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
            <Ionicons name={option.icon} size={20} color={grafito.accent} />
            <Text style={styles.rowLabel}>{option.title}</Text>
            <Ionicons name="chevron-forward" size={16} color={grafito.ink4} />
          </TouchableOpacity>
        ))}

        {inertOptions.map((option) => (
          <View key={option.title} style={[styles.row, styles.rowDisabled]}>
            <Ionicons name={option.icon} size={20} color={grafito.ink4} />
            <Text style={[styles.rowLabel, styles.rowLabelDisabled]}>
              {option.title}
            </Text>
            <Text style={styles.comingSoon}>Próximamente</Text>
          </View>
        ))}
      </View>

      <LogoutOption />
      <AppVersion />

      <View style={styles.spacer} />

      <BottomTabBar {...tabBar} />
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
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  title: {
    fontFamily: grafito.fonts.serif,
    fontSize: 22,
    color: grafito.ink,
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
    borderBottomColor: grafito.line2,
  },
  rowLabel: {
    flex: 1,
    fontFamily: grafito.fonts.sans,
    fontSize: 15,
    color: grafito.ink,
  },
  rowDisabled: {
    opacity: 0.6,
  },
  rowLabelDisabled: {
    color: grafito.ink4,
  },
  comingSoon: {
    fontFamily: grafito.fonts.sans,
    fontSize: 11,
    color: grafito.ink4,
  },
})

export default Settings
