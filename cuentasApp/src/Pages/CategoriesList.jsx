import { Dimensions, FlatList, View } from "react-native"
import categories from "../data/categories"
import Category from "../Components/Category"

const CategoriesList = () => {
    const gap = 10
    const categoryBoxSize = 100 + gap
    const numColumns = Math.floor(
        Dimensions.get("window").width / categoryBoxSize,
    )

    return (
        <FlatList
            numColumns={numColumns}
            keyExtractor={({ id }) => id}
            data={categories}
            horizontal={false}
            key={numColumns}
            ItemSeparatorComponent={<View style={{ marginBottom: 10 }} />}
            renderItem={({ item: category, index }) => (
                <Category
                    size={categoryBoxSize}
                    style={[
                        index % numColumns !== 0 ? { marginLeft: gap } : {},
                    ]}
                    name={category.name}
                    icon={category.icon}
                />
            )}
        />
    )
}

export default CategoriesList
