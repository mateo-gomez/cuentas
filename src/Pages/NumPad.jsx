import { StyleSheet, TouchableOpacity } from "react-native"
import VirtualKeyboard from "react-native-virtual-keyboard"
import { useNavigate, useOutletContext } from "react-router-native"
import StyledText from "../Components/StyledText"
import { theme } from "../theme"

const NumPad = () => {
    const { handlePressNumpad } = useOutletContext()

    const navigate = useNavigate()

    const handlePressCategories = () => {
        navigate("categories")
    }

    return (
        <>
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
        </>
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
        paddingVertical: 20,
    },
})

export default NumPad
