import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import grafito from "../theme"
import { StyledText } from "./StyledText"
import { formatNumber } from "../utils"
import { amountColor, amountSign } from "../utils/amountColor"
import { TransactionType } from "../../types"

interface PdfImportRowProps {
  date: string
  description: string
  value: number
  type: TransactionType
  categoryName: string
  possibleDuplicate: boolean
  included: boolean
  // Transfer (credit-card payment) support. The control is shown when the row
  // was auto-flagged as a likely card payment or the user turned it on.
  suggestedTransfer?: boolean
  isTransfer?: boolean
  transferAccountName?: string
  onToggleTransfer?: () => void
  onPressTransferAccount?: () => void
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
  suggestedTransfer,
  isTransfer,
  transferAccountName,
  onToggleTransfer,
  onPressTransferAccount,
  onChangeDescription,
  onPressCategory,
  onToggleIncluded,
  onRemove,
}: PdfImportRowProps) => {
  const isIncome = type === TransactionType.income
  const showTransferControls = suggestedTransfer || isTransfer

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
            { color: amountColor(isIncome ? "income" : "expense") },
          ]}
        >
          {amountSign(isIncome ? "income" : "expense")}
          {formatNumber(Math.abs(value))}
        </StyledText>

        {showTransferControls ? (
          <View style={styles.transferBox}>
            <TouchableOpacity
              style={styles.transferToggle}
              onPress={onToggleTransfer}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Ionicons
                name={isTransfer ? "checkbox" : "square-outline"}
                size={18}
                color={isTransfer ? grafito.accent : grafito.ink4}
              />
              <StyledText style={styles.transferLabel}>
                Pago de tarjeta (transferencia)
              </StyledText>
            </TouchableOpacity>

            {isTransfer ? (
              <TouchableOpacity
                style={styles.transferAccount}
                onPress={onPressTransferAccount}
              >
                <Ionicons name="card-outline" size={14} color={grafito.ink3} />
                <StyledText
                  style={[
                    styles.transferAccountText,
                    !transferAccountName && styles.categoryPlaceholder,
                  ]}
                >
                  {transferAccountName || "Elegir tarjeta destino"}
                </StyledText>
                <Ionicons name="chevron-down" size={14} color={grafito.ink4} />
              </TouchableOpacity>
            ) : null}
          </View>
        ) : null}
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
    fontFamily: grafito.amountFamily,
    ...grafito.numeric,
    fontSize: 15,
    marginTop: 4,
  },
  transferBox: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: grafito.line,
    gap: 6,
  },
  transferToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  transferLabel: {
    fontFamily: grafito.fonts.sans,
    fontSize: 13,
    color: grafito.ink3,
  },
  transferAccount: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    paddingVertical: 2,
    paddingLeft: 26,
  },
  transferAccountText: {
    fontFamily: grafito.fonts.sans,
    fontSize: 13,
    color: grafito.ink3,
  },
})
