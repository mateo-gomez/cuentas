import {
  FlatList,
  StyleProp,
  Text,
  TouchableOpacity,
  ViewStyle,
} from "react-native"
import CategoryChip from "./CategoryChip"
import { useThemedStyles } from "../theme/index"
import type { Theme } from "../theme/index"
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
  const styles = useThemedStyles(makeStyles)
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

const makeStyles = (theme: Theme) => ({
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
    backgroundColor: theme.palette.surface,
    borderWidth: 1,
    borderColor: theme.palette.line,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 6,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: theme.palette.ink,
  },
  cardName: {
    fontSize: 12,
    color: theme.palette.ink2,
    textAlign: "center" as const,
    marginTop: 6,
  },
  emptyText: {
    fontSize: 14,
    color: theme.palette.ink3,
    textAlign: "center" as const,
    paddingVertical: 24,
  },
})
