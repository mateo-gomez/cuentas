import { Dimensions, FlatList, View } from "react-native"
import { CategoryItem } from "./CategoryItem"
import { StyledText } from "./StyledText"
import { theme } from "../theme"
import { Category } from "../../types"

interface CategoryListProps {
  categories: Category[]
  onSelect: (category: Category) => void
  highlightCriteria: (category: Category) => boolean
}

export const CategoryList = ({
  categories,
  onSelect,
  highlightCriteria,
}: CategoryListProps) => {
  const gap = 10
  const categoryBoxSize = 90 + gap
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
      ItemSeparatorComponent={() => <View style={{ marginBottom: 10 }} />}
      ListEmptyComponent={<StyledText textCenter>Sin categorías</StyledText>}
      renderItem={({ item: category, index }) => {
        const isHighlight = highlightCriteria && highlightCriteria(category)

        return (
          <CategoryItem
            size={categoryBoxSize}
            style={[
              index % numColumns !== 0 && { marginLeft: gap },
              isHighlight && {
                backgroundColor: theme.colors.primary,
              },
            ]}
            color={isHighlight ? theme.colors.white : theme.colors.primary}
            icon={category.icon}
            name={category.name}
            onPress={() => onSelect(category)}
          />
        )
      }}
    />
  )
}
