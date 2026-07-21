import { TextInput, TouchableOpacity, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme, useThemedStyles, useAmount } from "../theme/index"
import type { Theme } from "../theme/index"
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
  const { theme } = useTheme()
  const styles = useThemedStyles(makeStyles)
  const { amountColor, amountSign } = useAmount()
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
          color={included ? theme.palette.accent : theme.palette.ink4}
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
          placeholderTextColor={theme.palette.ink4}
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
          <Ionicons name="chevron-down" size={14} color={theme.palette.ink4} />
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
                color={isTransfer ? theme.palette.accent : theme.palette.ink4}
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
                <Ionicons name="card-outline" size={14} color={theme.palette.ink3} />
                <StyledText
                  style={[
                    styles.transferAccountText,
                    !transferAccountName && styles.categoryPlaceholder,
                  ]}
                >
                  {transferAccountName || "Elegir tarjeta destino"}
                </StyledText>
                <Ionicons name="chevron-down" size={14} color={theme.palette.ink4} />
              </TouchableOpacity>
            ) : null}
          </View>
        ) : null}
      </View>

      <TouchableOpacity
        onPress={onRemove}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="close-circle-outline" size={22} color={theme.palette.ink4} />
      </TouchableOpacity>
    </View>
  )
}

const makeStyles = (theme: Theme) => ({
  container: {
    flexDirection: "row" as const,
    alignItems: "flex-start" as const,
    gap: 10,
    backgroundColor: theme.palette.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.palette.line,
    padding: 12,
  },
  containerFlagged: {
    backgroundColor: theme.palette.surface3,
    borderColor: theme.palette.ink5,
  },
  body: {
    flex: 1,
    gap: 4,
  },
  topRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
  },
  date: {
    fontFamily: theme.fonts.mono,
    fontSize: 12,
    color: theme.palette.ink3,
  },
  badge: {
    backgroundColor: theme.palette.ink5,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    fontFamily: theme.fonts.sans,
    fontSize: 10,
    fontWeight: "600" as const,
    color: theme.palette.surface,
  },
  description: {
    fontFamily: theme.fonts.sans,
    fontSize: 15,
    color: theme.palette.ink,
    paddingVertical: 2,
  },
  categoryPicker: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
    alignSelf: "flex-start" as const,
    paddingVertical: 2,
  },
  category: {
    fontFamily: theme.fonts.sans,
    fontSize: 13,
    color: theme.palette.ink3,
  },
  categoryPlaceholder: {
    color: theme.palette.ink4,
    fontStyle: "italic" as const,
  },
  value: {
    fontFamily: theme.amountFamily,
    ...theme.numeric,
    fontSize: 15,
    marginTop: 4,
  },
  transferBox: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: theme.palette.line,
    gap: 6,
  },
  transferToggle: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
  },
  transferLabel: {
    fontFamily: theme.fonts.sans,
    fontSize: 13,
    color: theme.palette.ink3,
  },
  transferAccount: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
    alignSelf: "flex-start" as const,
    paddingVertical: 2,
    paddingLeft: 26,
  },
  transferAccountText: {
    fontFamily: theme.fonts.sans,
    fontSize: 13,
    color: theme.palette.ink3,
  },
})
