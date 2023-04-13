import { StyleSheet, TouchableOpacity, View } from "react-native"
import { theme } from "../theme"
import StyledText from "./StyledText"
import { Ionicons } from "@expo/vector-icons"

const Category = ({
    name,
    icon,
    size,
    style,
    color,
    onPress,
    ...restOfProps
}) => {
    const styleWrapper = [
        styles.wrapper,
        {
            width: size,
            height: size,
            borderColor: color || theme.colors.primary,
        },
        style,
    ]

    const handlePressCategory = () => {
        onPress()
    }

    return (
        <TouchableOpacity
            onPress={handlePressCategory}
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
                        color={color || theme.colors.primary}
                        size={70}
                    />
                </View>
                {name ? (
                    <StyledText
                        fontWeight={"bold"}
                        style={{ color: color || theme.colors.primary }}
                        numberOfLines={1}
                    >
                        {name}
                    </StyledText>
                ) : null}
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
