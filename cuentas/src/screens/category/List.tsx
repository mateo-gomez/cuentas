import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useNavigate } from "react-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useTheme, useThemedStyles } from "../../theme/index"
import type { Theme } from "../../theme/index"
import { Screen } from "../../Components"
import CategoryChip from "../../Components/CategoryChip"
import { useCategories } from "../../hooks"

const CategoryList = () => {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const styles = useThemedStyles(makeStyles)
  const insets = useSafeAreaInsets()
  const { categories, loading, error } = useCategories()

  const emptyMessage = loading
    ? "Cargando…"
    : error
    ? "No se pudieron cargar las categorías"
    : "Todavía no tenés categorías. Creá la primera."

  return (
    <Screen style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigate(-1)}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="chevron-back" size={26} color={theme.palette.ink} />
        </TouchableOpacity>
        <Text style={styles.title}>Categorías</Text>
        <View style={{ width: 26 }} />
      </View>

      {/* ── New category ── */}
      <TouchableOpacity
        style={styles.newButton}
        onPress={() => navigate("/categories/create")}
        accessibilityRole="button"
        accessibilityLabel="Nueva categoría"
      >
        <Ionicons name="add" size={20} color={theme.palette.onAccent} />
        <Text style={styles.newButtonText}>Nueva categoría</Text>
      </TouchableOpacity>

      {/* ── List — single page-level scroll (reliable on web) ── */}
      <ScrollView
        style={styles.body}
        contentContainerStyle={[styles.bodyContent, { paddingBottom: 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {categories.length === 0 ? (
          <Text style={styles.message}>{emptyMessage}</Text>
        ) : (
          categories.map((item) => (
            <TouchableOpacity
              key={item._id}
              style={styles.row}
              onPress={() => navigate(`/categories/${item._id}`)}
              accessibilityRole="button"
              accessibilityLabel={`Editar ${item.name}`}
            >
              <CategoryChip
                size="md"
                categoryId={item._id}
                name={item.name}
                icon={item.icon}
              />
              <Text style={styles.rowName} numberOfLines={1}>
                {item.name}
              </Text>
              <Ionicons
                name="pencil-outline"
                size={18}
                color={theme.palette.ink4}
              />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </Screen>
  )
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 8,
      gap: 12,
    },
    title: {
      flex: 1,
      textAlign: "center",
      fontFamily: theme.fonts.serif,
      fontSize: 22,
      color: theme.palette.ink,
    },
    newButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      marginHorizontal: 20,
      marginBottom: 8,
      paddingVertical: 12,
      borderRadius: 12,
      backgroundColor: theme.palette.accent,
    },
    newButtonText: {
      fontFamily: theme.fonts.sans,
      fontSize: 15,
      fontWeight: "600",
      color: theme.palette.onAccent,
    },
    body: {
      flex: 1,
    },
    bodyContent: {
      paddingHorizontal: 20,
      paddingTop: 8,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.palette.line2,
    },
    rowName: {
      flex: 1,
      fontFamily: theme.fonts.sans,
      fontSize: 15,
      color: theme.palette.ink,
    },
    message: {
      fontFamily: theme.fonts.sans,
      fontSize: 14,
      color: theme.palette.ink3,
      textAlign: "center",
      paddingVertical: 32,
    },
  })

export default CategoryList
