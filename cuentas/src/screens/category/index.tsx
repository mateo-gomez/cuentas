import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import grafito from "../../theme"
import { useEffect, useState } from "react"
import CategoryGrid from "../../Components/CategoryGrid"
import { categoryIcons } from "../../constants/"
import { useNavigate, useParams } from "react-router-native"
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
  const navigate = useNavigate()
  const insets = useSafeAreaInsets()
  const { id } = useParams()
  const { category, loading, error } = useCategory(id)
  const [name, setName] = useState("")
  const [errors, setErrors] = useState({
    name: null,
    icon: null,
  })

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

      navigate("/")
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

      navigate("/")
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
          {category ? "Editar categoría" : "Nueva categoría"}
        </Text>

        <View style={styles.actions}>
          {id ? (
            <TouchableOpacity
              onPress={handleDeleteCategory}
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
        <TextInput
          textAlign="center"
          numberOfLines={1}
          maxLength={20}
          placeholder="Nombre"
          placeholderTextColor={grafito.ink5}
          style={[styles.nameInput, errors.name && styles.error]}
          onChangeText={handleChangeName}
          value={name}
        />

        {error ? (
          <Text style={styles.message}>
            Ha ocurrido un error al cargar las categorías
          </Text>
        ) : null}

        {loading ? <Text style={styles.message}>Cargando...</Text> : null}

        {!loading && !error ? (
          <CategoryGrid
            style={styles.grid}
            categories={availableCategories}
            onSelect={handleSelectCategory}
            isSelected={(category) =>
              !!categorySelected && category.icon === categorySelected.icon
            }
          />
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
    fontSize: 26,
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
  grid: {
    flex: 1,
  },
})

export default Category
