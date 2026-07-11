import {
  FlatList,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
} from "react-native"
import CategoryChip from "./CategoryChip"
import grafito from "../theme"
import { Category } from "../../types"

interface Props {
  categories: Category[]
  onSelect: (category: Category) => void
  isSelected: (category: Category) => boolean
  emptyLabel?: string
  style?: StyleProp<ViewStyle>
}

/**
 * Presentational 4-column grid of selectable category cards. Selection is driven
 * by the `isSelected` predicate so callers can match on whatever field they own
 * (_id, icon, ...) without this component knowing about it.
 */
export default function CategoryGrid({
  categories,
  onSelect,
  isSelected,
  emptyLabel = "Sin categorías",
  style,
}: Props) {
  return (
    <FlatList
      style={style}
      data={categories}
      keyExtractor={(item) => item._id}
      numColumns={4}
      contentContainerStyle={styles.listContent}
      columnWrapperStyle={styles.columnWrapper}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={<Text style={styles.emptyText}>{emptyLabel}</Text>}
      renderItem={({ item: category }) => {
        const selected = isSelected(category)

        return (
          <TouchableOpacity
            style={[styles.card, selected && styles.cardSelected]}
            onPress={() => onSelect(category)}
          >
            <CategoryChip
              size="lg"
              categoryId={category._id}
              name={category.name}
              icon={category.icon}
            />
            {category.name ? (
              <Text style={styles.cardName} numberOfLines={2}>
                {category.name}
              </Text>
            ) : null}
          </TouchableOpacity>
        )
      }}
    />
  )
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  columnWrapper: {
    gap: 8,
  },
  card: {
    flex: 1,
    backgroundColor: grafito.surface,
    borderWidth: 1,
    borderColor: grafito.line,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: grafito.ink,
  },
  cardName: {
    fontSize: 12,
    color: grafito.ink2,
    textAlign: "center",
    marginTop: 6,
  },
  emptyText: {
    fontSize: 14,
    color: grafito.ink3,
    textAlign: "center",
    paddingVertical: 24,
  },
})
