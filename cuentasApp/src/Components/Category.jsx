import { StyleSheet, TouchableOpacity, View } from "react-native"
import { theme } from "../theme"
import StyledText from "./StyledText"
import PlusIcon from "./svg/PlusIcon"

const Category = ({ name, icon, size, style, ...restOfProps }) => {
    const styleWrapper = [styles.wrapper, { width: size, height: size }, style]

    return (
        <TouchableOpacity {...restOfProps} style={styleWrapper}>
            <View
                style={{
                    flex: 1,
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: 5,
                }}
            >
                <View style={{ justifyContent: "center", flex: 1 }}>
                    <PlusIcon />
                </View>
                <StyledText numberOfLines={1}>{name}</StyledText>
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    wrapper: {
        borderStyle: "solid",
        borderColor: theme.colors.primary,
        width: 110,
        height: 110,
        borderWidth: 1,
    },
})

export default Category
