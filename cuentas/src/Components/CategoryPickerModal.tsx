import { FlatList, Modal, TouchableOpacity, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme, useThemedStyles } from "../theme/index"
import type { Theme } from "../theme/index"
import { StyledText } from "./StyledText"
import CategoryChip from "./CategoryChip"
import { Category } from "../../types"

interface CategoryPickerModalProps {
  visible: boolean
  categories: Category[]
  selectedName?: string
  onSelect: (categoryName: string) => void
  onClose: () => void
}

// Bottom-sheet style picker used by the PDF import review to assign a category
// per row. Selecting a category returns its name (categories are matched by
// name server-side via get-or-create).
export const CategoryPickerModal = ({
  visible,
  categories,
  selectedName,
  onSelect,
  onClose,
}: CategoryPickerModalProps) => {
  const { theme } = useTheme()
  const styles = useThemedStyles(makeStyles)
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity style={styles.sheet} activeOpacity={1}>
          <View style={styles.header}>
            <StyledText style={styles.title}>Elegir categoría</StyledText>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close" size={22} color={theme.palette.ink3} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={categories}
            keyExtractor={(item) => item._id ?? item.name}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => {
              const active = item.name === selectedName
              return (
                <TouchableOpacity
                  style={[styles.row, active && styles.rowActive]}
                  onPress={() => {
                    onSelect(item.name)
                    onClose()
                  }}
                >
                  <CategoryChip
                    categoryId={item._id ?? item.name}
                    name={item.name}
                    icon={item.icon}
                    size="md"
                  />
                  <StyledText style={styles.rowLabel}>{item.name}</StyledText>
                  {active ? (
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color={theme.palette.accent}
                    />
                  ) : null}
                </TouchableOpacity>
              )
            }}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  )
}

const makeStyles = (theme: Theme) => ({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end" as const,
  },
  sheet: {
    backgroundColor: theme.palette.bg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    maxHeight: "70%" as const,
  },
  header: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  title: {
    fontFamily: theme.fonts.serif,
    fontSize: 18,
    color: theme.palette.ink,
  },
  list: {
    paddingHorizontal: 12,
    paddingBottom: 24,
  },
  row: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  rowActive: {
    backgroundColor: theme.palette.surface3,
  },
  rowLabel: {
    flex: 1,
    fontFamily: theme.fonts.sans,
    fontSize: 15,
    color: theme.palette.ink,
  },
})
