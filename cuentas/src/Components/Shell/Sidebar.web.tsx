import { Ionicons } from "@expo/vector-icons"
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { useLocation, useNavigate } from "react-router"
import { useTheme, useThemedStyles } from "../../theme/index"
import type { Theme } from "../../theme/index"

type Item = {
  label: string
  path: string
  icon: keyof typeof Ionicons.glyphMap
  activeIcon: keyof typeof Ionicons.glyphMap
  match: (pathname: string) => boolean
}

const ITEMS: Item[] = [
  {
    label: "Inicio",
    path: "/",
    icon: "home-outline",
    activeIcon: "home",
    match: (p) => p === "/",
  },
  {
    label: "Cuentas",
    path: "/accounts",
    icon: "wallet-outline",
    activeIcon: "wallet",
    match: (p) => p.startsWith("/accounts"),
  },
  {
    label: "Presupuesto",
    path: "/budget",
    icon: "pie-chart-outline",
    activeIcon: "pie-chart",
    match: (p) => p.startsWith("/budget"),
  },
  {
    label: "Configuración",
    path: "/settings",
    icon: "settings-outline",
    activeIcon: "settings",
    match: (p) => p.startsWith("/settings"),
  },
]

export default function Sidebar() {
  const { theme } = useTheme()
  const styles = useThemedStyles(makeStyles)
  const location = useLocation()
  const navigate = useNavigate()

  const go = (path: string) => {
    if (path !== location.pathname) navigate(path)
  }

  return (
    <View style={styles.sidebar}>
      <View style={styles.brand}>
        <Image
          source={require("../../../assets/icon.png")}
          style={styles.mark}
          resizeMode="cover"
        />
        <Text style={styles.brandText}>Cuentas</Text>
      </View>

      <TouchableOpacity
        style={styles.newButton}
        onPress={() => navigate("/transactions/outcome")}
        accessibilityRole="button"
        accessibilityLabel="Registrar nueva transacción"
      >
        <Ionicons name="add" size={20} color={theme.palette.onAccent} />
        <Text style={styles.newLabel}>Nueva transacción</Text>
      </TouchableOpacity>

      <View style={styles.nav}>
        {ITEMS.map((item) => {
          const active = item.match(location.pathname)
          const color = active ? theme.palette.ink : theme.palette.ink3
          return (
            <TouchableOpacity
              key={item.path}
              style={[styles.item, active && styles.itemActive]}
              onPress={() => go(item.path)}
              accessibilityRole="link"
              accessibilityState={{ selected: active }}
            >
              <Ionicons
                name={active ? item.activeIcon : item.icon}
                size={20}
                color={color}
              />
              <Text
                style={[
                  styles.itemLabel,
                  { color },
                  active && styles.itemLabelActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}

const makeStyles = (theme: Theme) => ({
  sidebar: {
    width: 256,
    paddingHorizontal: 16,
    paddingTop: 28,
    paddingBottom: 20,
    backgroundColor: theme.palette.surface,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: theme.palette.line,
  },
  brand: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 10,
    paddingHorizontal: 8,
    marginBottom: 28,
  },
  mark: {
    width: 30,
    height: 30,
    borderRadius: 9,
  },
  brandText: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: theme.palette.ink,
    letterSpacing: 0.2,
  },
  newButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 8,
    height: 44,
    borderRadius: 12,
    backgroundColor: theme.palette.accent,
    marginBottom: 24,
  },
  newLabel: {
    color: theme.palette.onAccent,
    fontSize: 14,
    fontWeight: "600" as const,
  },
  nav: {
    gap: 4,
  },
  item: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    height: 42,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  itemActive: {
    backgroundColor: theme.palette.surface3,
  },
  itemLabel: {
    fontSize: 14,
    fontWeight: "500" as const,
  },
  itemLabelActive: {
    fontWeight: "600" as const,
  },
})
