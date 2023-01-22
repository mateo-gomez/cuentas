import { TouchableOpacity, View } from "react-native"
import { useNavigate } from "react-router-native"
import { theme } from "../theme"
import BackArrowIcon from "./svg/BackArrowIcon"

const BackButton = ({ to = -1, size, color, ...restOfProps }) => {
    const navigate = useNavigate()

    const handlePress = () => {
        navigate(to)
    }

    return (
        <TouchableOpacity onPress={handlePress}>
            <View {...restOfProps}>
                <BackArrowIcon
                    color={size || theme.colors.white}
                    size={color || theme.fontSizes.subheading}
                />
            </View>
        </TouchableOpacity>
    )
}

export default BackButton
