import {
  Collapse,
  CollapseBody,
  CollapseHeader,
} from "accordion-collapse-react-native"
import { Ionicons } from "@expo/vector-icons"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { useNavigate } from "react-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import grafito from "../../theme"
import { CategoriesOptions } from "../../Components/CategoriesOptions"
import { LogoutOption } from "../../Components/LogoutOption"
import { AppVersion } from "../../Components/AppVersion"

// Migrated from the removed OptionsSideBar drawer (settings hub — design §3d).
const navigationOptions = [
  {
    title: "Categorías",
    icon: "grid-outline" as const,
    options: <CategoriesOptions />,
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
]

// Non-functional placeholders — out of scope per spec non-goals.
const inertOptions = [
  { title: "Moneda", icon: "cash-outline" as const },
  { title: "Tema", icon: "color-palette-outline" as const },
  { title: "Notificaciones", icon: "notifications-outline" as const },
]

const Settings = () => {
  const navigate = useNavigate()
  const insets = useSafeAreaInsets()

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigate(-1)}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="chevron-back" size={26} color={grafito.ink} />
        </TouchableOpacity>
        <Text style={styles.title}>Configuración</Text>
        <View style={{ width: 26 }} />
      </View>

      <View style={styles.list}>
        {navigationOptions.map((option) =>
          option.options ? (
            <Collapse key={option.title}>
              <CollapseHeader>
                <View style={styles.row}>
                  <Ionicons
                    name={option.icon}
                    size={20}
                    color={grafito.accent}
                  />
                  <Text style={styles.rowLabel}>{option.title}</Text>
                  <Ionicons
                    name="chevron-down"
                    size={16}
                    color={grafito.ink4}
                  />
                </View>
              </CollapseHeader>
              <CollapseBody>{option.options}</CollapseBody>
            </Collapse>
          ) : (
            <TouchableOpacity
              key={option.title}
              style={styles.row}
              onPress={() => navigate(option.to)}
            >
              <Ionicons name={option.icon} size={20} color={grafito.accent} />
              <Text style={styles.rowLabel}>{option.title}</Text>
              <Ionicons name="chevron-forward" size={16} color={grafito.ink4} />
            </TouchableOpacity>
          ),
        )}

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
    textAlign: "center",
    fontFamily: grafito.fonts.serif,
    fontSize: 20,
    color: grafito.ink,
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
