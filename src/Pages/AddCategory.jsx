import { StyleSheet, TextInput, TouchableHighlight, View } from "react-native"
import StyledText from "../Components/StyledText"
import AppBar from "../Components/AppBar"
import BackButton from "../Components/BackButton"
import { theme } from "../theme"
import { useEffect, useState } from "react"
import CategoryList from "../Components/CategoryList"
import { categoryIcons } from "../constants/availableCategories"
import { useNavigate, useParams } from "react-router-native"
import {useCategory} from "../hooks/useCategory"
import { client } from "../helpers/client"

const availableCategories = categoryIcons.map((icon) => ({ _id: icon, icon }))

const updateCategory = async (id, category) => {
    const data = await client.put(`categories/${id}`, category)

    return data
}

const createCategory = async (newCategory) => {
    const data = await client.post('/categories', newCategory)

    return data
}

const AddCategory = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const { category, loading, error } = useCategory(id)
    const [name, setName] = useState("")
    const [categorySelected, setCategorySelected] = useState(null)
    const [errors, setErrors] = useState({
        name: null,
        icon: null,
    })

    useEffect(() => {
        if (category) {
            setCategorySelected(() => category)
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
            console.error('Error: ' + error.message)

            if (error.errors) {
                setErrors(error.errors)
            }
        }
    }

    return (
        <View style={{ flex: 1 }}>
            <AppBar style={{ justifyContent: "space-between" }}>
                <View style={{ flexDirection: "row" }}>
                    <BackButton />

                    <StyledText color={"white"} fontWeight="bold">
                        {category ? "Editar categoría" : "Nueva categoría"}
                    </StyledText>
                </View>

                <TouchableHighlight onPress={handleSubmit}>
                    <StyledText color={"white"}>{id ? 'GUARDAR' : 'AÑADIR'}</StyledText>
                </TouchableHighlight>
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

                <View style={styles.categories}>
                    {error ?
                        <StyledText>
                            "Ha ocurrido un error al cargar las categorías"
                        </StyledText>
                    : null}

                    {loading ? <StyledText>Cargando...</StyledText> : null}

                    {!loading && !error ?
                        <CategoryList
                            categories={availableCategories}
                            onSelect={handleSelectCategory}
                            selection={categorySelected}
                        />
                    : null}
                </View>
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
        marginTop: 20,
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

export default AddCategory