import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import VirtualKeyboard from "react-native-virtual-keyboard"
import { useNavigate, useOutletContext } from "react-router"
import { Ionicons } from "@expo/vector-icons"
import grafito from "../../theme"
import { Fragment } from "react"

interface NumpadOutletContext {
  handlePressNumpad: (num: number) => void
  handleSave: () => void
  hasCategory: boolean
  isValidTransactionValue: () => boolean
}

const NumPad = () => {
  const { handlePressNumpad, handleSave, hasCategory, isValidTransactionValue } =
    useOutletContext<NumpadOutletContext>()

  const navigate = useNavigate()

  // Single primary action, context-aware. With a category already resolved
  // (edit or suggestion chip) this commits directly — thumb stays on the pad,
  // one tap after the amount. Without a category, it routes to the grid where
  // selecting one is the terminal action (see handleSelectCategory shortcut).
  const handlePressPrimary = () => {
    if (!isValidTransactionValue()) return

    if (hasCategory) {
      handleSave()
      return
    }

    navigate("categories")
  }

  return (
    <Fragment>
      <VirtualKeyboard
        decimal
        clearOnLongPress
        style={styles.numPad}
        rowStyle={styles.numPadRow}
        cellStyle={styles.numPadCell}
        color={grafito.ink}
        onPress={handlePressNumpad}
      />

      <TouchableOpacity
        style={styles.categoryTouchable}
        onPress={handlePressPrimary}
      >
        <Text style={styles.categoryText}>
          {hasCategory ? "Guardar" : "Elegir categoría"}
        </Text>
      </TouchableOpacity>
    </Fragment>
  )
}

const styles = StyleSheet.create({
  numPad: {
    backgroundColor: "transparent",
    marginBottom: 0,
    marginTop: 0,
    marginLeft: 0,
    marginRight: 0,
    paddingVertical: 4,
  },
  numPadRow: {
    marginTop: 0,
  },
  numPadCell: {
    height: 58,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryTouchable: {
    marginTop: 8,
    backgroundColor: grafito.accent,
    borderRadius: 12,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 16,
  },
  categoryText: {
    color: grafito.onAccent,
    fontSize: 15,
  },
})

export default NumPad
