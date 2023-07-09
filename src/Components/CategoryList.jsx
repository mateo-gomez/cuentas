import { Dimensions, FlatList, View } from "react-native"
import Category from "./Category"
import StyledText from "./StyledText"
import { theme } from "../theme"

const CategoryList = ({ categories, onSelect, selection }) => {
    const gap = 10
    const categoryBoxSize = 100 + gap
    const numColumns = Math.floor(
        Dimensions.get("window").width / categoryBoxSize,
    )

    return (
        <FlatList
            numColumns={numColumns}
            keyExtractor={({ _id }) => _id}
            data={categories}
            horizontal={false}
            key={numColumns}
            ItemSeparatorComponent={<View style={{ marginBottom: 10 }} />}
            ListEmptyComponent={
                <StyledText textCenter>Sin categorías</StyledText>
            }
            renderItem={({ item: category, index }) => {
                // TODO: separar categroyList de categoryOptions, esto puede ocacionar que al editar
                // una transacción se seleccione la categoría que no es, si la categoria comparte icon con otra
                const isSelected = selection && category.icon === selection.icon

                return (
                    <Category
                        size={categoryBoxSize}
                        style={[
                            index % numColumns !== 0 && { marginLeft: gap },
                            isSelected && {
                                backgroundColor: theme.colors.primary,
                            },
                        ]}
                        color={
                            isSelected
                                ? theme.colors.white
                                : theme.colors.primary
                        }
                        icon={category.icon}
                        name={category.name}
                        onPress={() => onSelect(category)}
                    />
                )
            }}
        />
    )
}

export default CategoryList
