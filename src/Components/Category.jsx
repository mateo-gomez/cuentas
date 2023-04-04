import { StyleSheet, TouchableOpacity, View } from "react-native"
import { theme } from "../theme"
import StyledText from "./StyledText"
import { Ionicons } from "@expo/vector-icons"

const Category = ({ name, icon, size, style, onPress, ...restOfProps }) => {
    const styleWrapper = [styles.wrapper, { width: size, height: size }, style]

    return (
        <TouchableOpacity
            onPress={onPress}
            style={styleWrapper}
            {...restOfProps}
        >
            <View
                style={{
                    flex: 1,
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: 5,
                }}
            >
                <View style={{ justifyContent: "center", flex: 1 }}>
                    <Ionicons
                        name={icon}
                        color={theme.colors.primary}
                        size={70}
                    />
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
