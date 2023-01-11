import { Text, TouchableOpacity, View } from "react-native"
import { useNavigate } from "react-router-native"

const AddTransaction = () => {
    const navigate = useNavigate()

    const handlePress = () => {
        navigate(-1)
    }

    return (
        <View>
            <Text>Add transaction view</Text>
            <TouchableOpacity onPress={handlePress}>
                <Text>back</Text>
            </TouchableOpacity>
        </View>
    )
}

export default AddTransaction
