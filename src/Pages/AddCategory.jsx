import { StyleSheet, TextInput, TouchableHighlight, View } from "react-native"
import StyledText from "../Components/StyledText"
import AppBar from "../Components/AppBar"
import BackButton from "../Components/BackButton"
import { theme } from "../theme"
import { useState } from "react"
import CategoryList from "../Components/CategoryList"
import useCategories from "../hooks/useCategories"
import { categoryIcons } from "../constants/availableCategories"
import Constants from "expo-constants"
import { useNavigate } from "react-router-native"

const { apiUrl } = Constants.expoConfig.extra
const availableCategories = categoryIcons.map((icon) => ({ _id: icon, icon }))

const AddCategory = ({ category }) => {
    const navigate = useNavigate()

    const [name, setName] = useState("")
    const [categorySelected, setCategorySelected] = useState(null)
    const [errors, setErrors] = useState({
        name: null,
        icon: null,
    })

    const handleChangeName = (text) => {
        setName(() => text)
    }

    const handleSelectCategory = (category) => {
        setCategorySelected(() => category)
    }

    const handleSubmit = async () => {
        const newCategory = {
            name,
            icon: categorySelected.icon,
        }

        try {
            const response = await fetch(`${apiUrl}/categories`, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newCategory),
            })

            const data = await response.json()

            console.log("add category response", data)

            navigate("/")
        } catch (error) {
            console.error("add category error", error)
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
                    <StyledText color={"white"}>AÑADIR</StyledText>
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
                    <CategoryList
                        categories={availableCategories}
                        onSelect={handleSelectCategory}
                        selection={categorySelected}
                    />
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
