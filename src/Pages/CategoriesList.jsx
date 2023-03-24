import { Dimensions, FlatList, View } from "react-native"
import Category from "../Components/Category"
import { useOutletContext } from "react-router-native"
import { useEffect, useState } from "react"
import Constants from "expo-constants"
import StyledText from "../Components/StyledText"

const { apiUrl } = Constants.expoConfig.extra

const CategoriesList = () => {
    const gap = 10
    const categoryBoxSize = 100 + gap
    const numColumns = Math.floor(
        Dimensions.get("window").width / categoryBoxSize,
    )

    const { handleSelectCategory } = useOutletContext()

    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const getCategories = async () => {
            setLoading(true)

            try {
                const response = await fetch(`${apiUrl}/categories`)
                const data = await response.json()

                setCategories(data)
            } catch (error) {
                console.log(error)
            } finally {
                setLoading(false)
            }
        }

        getCategories()
    }, [])

    return loading ? (
        <StyledText textCenter>Cargando...</StyledText>
    ) : (
        <FlatList
            numColumns={numColumns}
            keyExtractor={({ id }) => id}
            data={categories}
            horizontal={false}
            key={numColumns}
            ItemSeparatorComponent={<View style={{ marginBottom: 10 }} />}
            ListEmptyComponent={
                <StyledText textCenter>Sin categorías</StyledText>
            }
            renderItem={({ item: category, index }) => (
                <Category
                    size={categoryBoxSize}
                    style={[
                        index % numColumns !== 0 ? { marginLeft: gap } : {},
                    ]}
                    name={category.name}
                    icon={category.icon}
                    onPress={() => handleSelectCategory(category)}
                />
            )}
        />
    )
}

export default CategoriesList
