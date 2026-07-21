import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import { useTheme, useThemedStyles } from "../../theme/index"
import type { Theme } from "../../theme/index"
import { useEffect, useMemo, useState } from "react"
import CategoryChip from "../../Components/CategoryChip"
import { categoryIcons } from "../../constants/"
import { useNavigate, useParams } from "react-router"
import { Ionicons } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Category as CategoryType } from "../../../types"
import { useCategory, useSelect } from "../../hooks"
import { createCategory, deleteCategory, updateCategory } from "../../services"
import { createLogger } from "../../lib/logger"

const logger = createLogger("Category")

const availableCategories = Object.values(categoryIcons).map(
  (icon): CategoryType => ({
    _id: icon,
    icon,
    name: "",
  }),
)

const Category = () => {
  const { theme } = useTheme()
  const styles = useThemedStyles(makeStyles)
  const navigate = useNavigate()
  const insets = useSafeAreaInsets()
  const { id } = useParams()
  const { category, loading, error } = useCategory(id)
  const [name, setName] = useState("")
  const [iconQuery, setIconQuery] = useState("")
  const [errors, setErrors] = useState({
    name: null,
    icon: null,
  })

  const filteredIcons = useMemo(() => {
    const q = iconQuery.trim().toLowerCase()
    if (!q) return availableCategories
    return availableCategories.filter((c) => c.icon.includes(q))
  }, [iconQuery])

  const { selected: categorySelected, setSelected: setCategorySelected } =
    useSelect<CategoryType>(category)

  useEffect(() => {
    if (category) {
      setName(() => category.name)
    }
  }, [category])

  const handleChangeName = (text) => {
    setName(() => text)
  }

  const handleSelectCategory = (category) => {
    setCategorySelected(() => category)
  }

  const handleSubmit = async () => {
    if (!name || !categorySelected) {
      setErrors(() => ({
        name: !name ? "Nombre inválido" : "",
        icon: !categorySelected ? "Categoría no seleccionada" : "",
      }))
      return
    }

    const categoryData = {
      name,
      icon: categorySelected.icon,
    }

    try {
      if (id) {
        await updateCategory(id, categoryData)
      }

      if (!id) {
        await createCategory(categoryData)
      }

      navigate("/categories")
    } catch (error) {
      logger.error("Submit category failed", { message: error.message })

      if (error.errors) {
        setErrors(error.errors)
      }
    }
  }

  const handleDeleteCategory = async () => {
    try {
      await deleteCategory(id)

      navigate("/categories")
    } catch (error) {
      throw error
    }
  }

  return (
    <View
      style={[
        styles.screen,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigate(-1)}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="chevron-back" size={26} color={theme.palette.ink} />
        </TouchableOpacity>

        <Text style={styles.title} numberOfLines={1}>
          {category ? "Editar categoría" : "Nueva categoría"}
        </Text>

        <View style={styles.actions}>
          {id ? (
            <TouchableOpacity
              onPress={handleDeleteCategory}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons name="trash-outline" size={22} color={theme.palette.ink3} />
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity style={styles.savePill} onPress={handleSubmit}>
            <Text style={styles.savePillText}>{id ? "Guardar" : "Añadir"}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Fixed top: preview + name + icon search stay visible while the
          icon grid below scrolls on its own ── */}
      <View style={styles.fixedTop}>
        <View style={styles.preview}>
          <CategoryChip
            size="lg"
            categoryId={categorySelected?.icon ?? name ?? "preview"}
            name={name}
            icon={categorySelected?.icon}
          />
        </View>

        <TextInput
          textAlign="center"
          numberOfLines={1}
          maxLength={20}
          placeholder="Nombre"
          placeholderTextColor={theme.palette.ink5}
          style={[styles.nameInput, errors.name && styles.error]}
          onChangeText={handleChangeName}
          value={name}
        />

        {!loading && !error ? (
          <View style={styles.search}>
            <Ionicons name="search" size={16} color={theme.palette.ink4} />
            <TextInput
              placeholder="Buscar ícono"
              placeholderTextColor={theme.palette.ink5}
              style={styles.searchInput}
              onChangeText={setIconQuery}
              value={iconQuery}
              autoCorrect={false}
              autoCapitalize="none"
            />
            {iconQuery ? (
              <TouchableOpacity
                onPress={() => setIconQuery("")}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close-circle" size={16} color={theme.palette.ink4} />
              </TouchableOpacity>
            ) : null}
          </View>
        ) : null}
      </View>

      {error ? (
        <Text style={styles.message}>
          Ha ocurrido un error al cargar las categorías
        </Text>
      ) : null}

      {loading ? <Text style={styles.message}>Cargando...</Text> : null}

      {/* ── Icon grid: the only scrollable region ── */}
      {!loading && !error ? (
        <ScrollView
          style={styles.gridScroll}
          contentContainerStyle={[styles.gridContent, { paddingBottom: 24 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.grid}>
            {filteredIcons.map((cat) => {
              const selected =
                !!categorySelected && cat.icon === categorySelected.icon
              return (
                <TouchableOpacity
                  key={cat._id}
                  style={[styles.card, selected && styles.cardSelected]}
                  onPress={() => handleSelectCategory(cat)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={cat.icon}
                >
                  <CategoryChip
                    size="lg"
                    categoryId={cat._id}
                    name={cat.name}
                    icon={cat.icon}
                  />
                </TouchableOpacity>
              )
            })}

            {filteredIcons.length === 0 ? (
              <Text style={styles.message}>Ningún ícono coincide</Text>
            ) : null}
          </View>
        </ScrollView>
      ) : null}
    </View>
  )
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.palette.bg,
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
    fontFamily: theme.fonts.serif,
    fontSize: 20,
    color: theme.palette.ink,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  savePill: {
    backgroundColor: theme.palette.accent,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  savePillText: {
    fontFamily: theme.fonts.sans,
    fontSize: 15,
    fontWeight: "600",
    color: theme.palette.onAccent,
  },
  fixedTop: {
    paddingHorizontal: 20,
  },
  gridScroll: {
    flex: 1,
  },
  gridContent: {
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  preview: {
    alignItems: "center",
    marginTop: 16,
  },
  nameInput: {
    backgroundColor: theme.palette.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.palette.line,
    color: theme.palette.ink,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: theme.fonts.serif,
    fontSize: 26,
    marginTop: 12,
    marginBottom: 12,
  },
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: theme.palette.surface3,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontFamily: theme.fonts.sans,
    fontSize: 15,
    color: theme.palette.ink,
    padding: 0,
  },
  error: {
    borderColor: theme.palette.neg,
  },
  message: {
    fontFamily: theme.fonts.sans,
    fontSize: 14,
    color: theme.palette.ink3,
    textAlign: "center",
    marginVertical: 12,
    width: "100%",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 10,
  },
  card: {
    width: "23%",
    backgroundColor: theme.palette.surface,
    borderWidth: 1,
    borderColor: theme.palette.line,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: theme.palette.ink,
  },
  })

export default Category
