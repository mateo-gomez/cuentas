import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native"
import { theme } from "../../theme"
import { useEffect, useState } from "react"
import { AppBar, BackButton, CategoryList, StyledText } from "../../Components"
import { categoryIcons } from "../../constants/"
import { useNavigate, useParams } from "react-router-native"
import { Ionicons } from "@expo/vector-icons"
import { Category as CategoryType } from "../../../types"
import { useCategory, useSelect } from "../../hooks"
import { createCategory, deleteCategory, updateCategory } from "../../services"

const availableCategories = Object.values(categoryIcons).map(
  (icon): CategoryType => ({
    _id: icon,
    icon,
    name: "",
  }),
)

const Category = () => {
  const navigate = useNavigate()
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
      console.error("Error: " + error.message)

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
    <View style={{ flex: 1 }}>
      <AppBar>
        <View
          style={{
            flexDirection: "row",
            width: "100%",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flexDirection: "row" }}>
            <BackButton />

            <StyledText color={"white"} fontWeight="bold">
              {category ? "Editar categoría" : "Nueva categoría"}
            </StyledText>
          </View>

          <View style={{ flexDirection: "row", gap: 10 }}>
            <TouchableOpacity onPress={handleDeleteCategory}>
              <Ionicons
                name={"trash-outline"}
                color={theme.colors.white}
                size={theme.fontSizes.subheading}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSubmit}>
              <StyledText color={"white"}>
                {id ? "GUARDAR" : "AÑADIR"}
              </StyledText>
            </TouchableOpacity>
          </View>
        </View>
      </AppBar>
      <View style={styles.container}>
        <TextInput
          textAlign="center"
          numberOfLines={1}
          maxLength={20}
          showSoftInputOnFocus={false}
          placeholder="Nombre"
          style={[styles.nameInput, errors.name && styles.error]}
          onChangeText={handleChangeName}
          value={name}
        />

        {error ? (
          <StyledText textCenter>
            "Ha ocurrido un error al cargar las categorías"
          </StyledText>
        ) : null}

        {loading ? <StyledText textCenter>Cargando...</StyledText> : null}

        {!loading && !error ? (
          <CategoryList
            categories={availableCategories}
            onSelect={handleSelectCategory}
            highlightCriteria={(category) =>
              categorySelected && category.icon === categorySelected.icon
            }
          />
        ) : null}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  nameInput: {
    borderRadius: 10,
    borderColor: theme.colors.transparent,
    borderWidth: 2,
    backgroundColor: theme.colors.primary,
    color: theme.colors.white,
    padding: 10,
    fontSize: theme.fontSizes.heading * 1.5,
    marginVertical: 20,
  },
  error: {
    borderColor: theme.colors.red,
    borderWidth: 2,
  },
  categories: {
    marginTop: 20,
  },
  container: {
    flex: 1,
    padding: 20,
  },
})

export default Category
