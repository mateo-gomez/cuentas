import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import grafito from "../theme"
import { StyledText } from "./StyledText"
import { formatNumber } from "../utils"
import { TransactionType } from "../../types"

interface PdfImportRowProps {
  date: string
  description: string
  value: number
  type: TransactionType
  categoryName: string
  possibleDuplicate: boolean
  included: boolean
  onChangeDescription: (description: string) => void
  onPressCategory: () => void
  onToggleIncluded: () => void
  onRemove: () => void
}

// Presentational row for the PDF import review list. Extracted so the
// review screen composes a list without duplicating markup/styles per row.
export const PdfImportRow = ({
  date,
  description,
  value,
  type,
  categoryName,
  possibleDuplicate,
  included,
  onChangeDescription,
  onPressCategory,
  onToggleIncluded,
  onRemove,
}: PdfImportRowProps) => {
  const isIncome = type === TransactionType.income

  return (
    <View
      style={[styles.container, possibleDuplicate && styles.containerFlagged]}
    >
      <TouchableOpacity
        onPress={onToggleIncluded}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons
          name={included ? "checkbox" : "square-outline"}
          size={22}
          color={included ? grafito.accent : grafito.ink4}
        />
      </TouchableOpacity>

      <View style={styles.body}>
        <View style={styles.topRow}>
          <StyledText style={styles.date}>{date}</StyledText>
          {possibleDuplicate ? (
            <View style={styles.badge}>
              <StyledText style={styles.badgeText}>
                Posible duplicado
              </StyledText>
            </View>
          ) : null}
        </View>

        <TextInput
          style={styles.description}
          value={description}
          onChangeText={onChangeDescription}
          placeholder="Descripción"
          placeholderTextColor={grafito.ink4}
        />

        <TouchableOpacity
          style={styles.categoryPicker}
          onPress={onPressCategory}
        >
          <StyledText
            style={[
              styles.category,
              !categoryName && styles.categoryPlaceholder,
            ]}
          >
            {categoryName || "Elegir categoría"}
          </StyledText>
          <Ionicons name="chevron-down" size={14} color={grafito.ink4} />
        </TouchableOpacity>

        <StyledText
          selectable
          style={[
            styles.value,
            { color: isIncome ? grafito.pos : grafito.neg },
          ]}
        >
          {isIncome ? "+" : "-"}
          {formatNumber(Math.abs(value))}
        </StyledText>
      </View>

      <TouchableOpacity
        onPress={onRemove}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="close-circle-outline" size={22} color={grafito.ink4} />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: grafito.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: grafito.line,
    padding: 12,
  },
  containerFlagged: {
    backgroundColor: grafito.surface3,
    borderColor: grafito.ink5,
  },
  body: {
    flex: 1,
    gap: 4,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  date: {
    fontFamily: grafito.fonts.mono,
    fontSize: 12,
    color: grafito.ink3,
  },
  badge: {
    backgroundColor: grafito.ink5,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    fontFamily: grafito.fonts.sans,
    fontSize: 10,
    fontWeight: "600",
    color: grafito.surface,
  },
  description: {
    fontFamily: grafito.fonts.sans,
    fontSize: 15,
    color: grafito.ink,
    paddingVertical: 2,
  },
  categoryPicker: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    paddingVertical: 2,
  },
  category: {
    fontFamily: grafito.fonts.sans,
    fontSize: 13,
    color: grafito.ink3,
  },
  categoryPlaceholder: {
    color: grafito.ink4,
    fontStyle: "italic",
  },
  value: {
    fontFamily: grafito.fonts.mono,
    fontSize: 15,
    fontWeight: "600",
    marginTop: 4,
  },
})
