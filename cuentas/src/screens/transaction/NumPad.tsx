import { StyleSheet, TouchableOpacity } from "react-native"
import VirtualKeyboard from "react-native-virtual-keyboard"
import { useNavigate, useOutletContext } from "react-router-native"
import { StyledText } from "../../Components"
import { theme } from "../../theme"
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
        color={theme.colors.primary}
        onPress={handlePressNumpad}
      />

      <TouchableOpacity
        style={styles.categoryTouchable}
        onPress={handlePressCategories}
      >
        <StyledText
          style={styles.categoryText}
          textCenter
          fontSize={"subheading"}
        >
          Seleccionar categoría
        </StyledText>
      </TouchableOpacity>
    </Fragment>
  )
}

const styles = StyleSheet.create({
  categoryText: {
    borderStyle: "solid",
    borderColor: theme.colors.primary,
    borderWidth: 1,
    padding: 20,
    borderRadius: 10,
  },
  categoryTouchable: { marginTop: 20 },
  numPad: {
    marginBottom: 0,
    marginTop: 0,
    marginLeft: 0,
    marginRight: 0,
    paddingVertical: 10,
    borderStyle: "solid",
    borderColor: theme.colors.primary,
    borderWidth: 1,
    borderRadius: 10,
  },
  numPadRow: {
    marginTop: 0,
  },
  numPadCell: {
    paddingVertical: 16,
  },
})

export default NumPad
