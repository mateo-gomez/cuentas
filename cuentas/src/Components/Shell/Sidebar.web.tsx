import { Ionicons } from "@expo/vector-icons"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { useLocation, useNavigate } from "react-router"
import grafito from "../../theme"

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
    label: "Perfil",
    path: "/profile",
    icon: "person-outline",
    activeIcon: "person",
    match: (p) => p.startsWith("/profile"),
  },
]

export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()

  const go = (path: string) => {
    if (path !== location.pathname) navigate(path)
  }

  return (
    <View style={styles.sidebar}>
      <View style={styles.brand}>
        <View style={styles.mark}>
          <Ionicons name="reader-outline" size={18} color={grafito.onAccent} />
        </View>
        <Text style={styles.brandText}>Cuentas</Text>
      </View>

      <TouchableOpacity
        style={styles.newButton}
        onPress={() => navigate("/transactions/outcome")}
        accessibilityRole="button"
        accessibilityLabel="Registrar nueva transacción"
      >
        <Ionicons name="add" size={20} color={grafito.onAccent} />
        <Text style={styles.newLabel}>Nueva transacción</Text>
      </TouchableOpacity>

      <View style={styles.nav}>
        {ITEMS.map((item) => {
          const active = item.match(location.pathname)
          const color = active ? grafito.ink : grafito.ink3
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
                style={[styles.itemLabel, { color }, active && styles.itemLabelActive]}
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

const styles = StyleSheet.create({
  sidebar: {
    width: 256,
    paddingHorizontal: 16,
    paddingTop: 28,
    paddingBottom: 20,
    backgroundColor: grafito.surface,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: grafito.line,
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 8,
    marginBottom: 28,
  },
  mark: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: grafito.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  brandText: {
    fontSize: 18,
    fontWeight: "600",
    color: grafito.ink,
    letterSpacing: 0.2,
  },
  newButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 44,
    borderRadius: 12,
    backgroundColor: grafito.accent,
    marginBottom: 24,
  },
  newLabel: {
    color: grafito.onAccent,
    fontSize: 14,
    fontWeight: "600",
  },
  nav: {
    gap: 4,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    height: 42,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  itemActive: {
    backgroundColor: grafito.surface3,
  },
  itemLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  itemLabelActive: {
    fontWeight: "600",
  },
})
