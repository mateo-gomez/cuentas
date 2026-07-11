import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import VirtualKeyboard from "react-native-virtual-keyboard"
import { useNavigate, useOutletContext } from "react-router-native"
import { Ionicons } from "@expo/vector-icons"
import grafito from "../../theme"
import { Fragment } from "react"

interface NumpadOutletContext {
  handlePressNumpad: (num: number) => void
  isValidTransactionValue: () => boolean
}

const NumPad = () => {
  const { handlePressNumpad, isValidTransactionValue } =
    useOutletContext<NumpadOutletContext>()

  const navigate = useNavigate()

  const handlePressCategories = () => {
    if (!isValidTransactionValue()) return

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
        onPress={handlePressCategories}
      >
        <Text style={styles.categoryText}>Seleccionar categoría</Text>
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
