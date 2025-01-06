// crea una pantalla de inicio de sesión de usuario en inglés
import {
  View,
  Text,
  TextInput,
  Button,
  KeyboardAvoidingView,
  Pressable,
  GestureResponderEvent,
  TouchableOpacity,
} from "react-native"
import { useState } from "react"
import { useAuth } from "../../hooks/useAuth"
import { StyledText } from "../../Components"
import { theme } from "../../theme"
import { useNavigate } from "react-router-native"

const Signup = () => {
  const { register, error } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [surename, setSurename] = useState("")
  const [lastname, setLastname] = useState("")
  const navigate = useNavigate()

  const handleRegister = async () => {
    try {
      await register({ email, password, name, surename, lastname })
    } catch (error) {
      console.error("error al intentar registrar", error)
    }
  }

  const handleLogin = async () => {
    navigate("/login")
  }

  return (
    <KeyboardAvoidingView
      behavior="padding"
      style={{ justifyContent: "center", margin: 20, flex: 1 }}
    >
      <View>
        <View style={{ marginBottom: 20 }}>
          <StyledText fontSize="heading">Crea tu cuenta</StyledText>
        </View>

        <View style={{ gap: 20 }}>
          <TextInput
            style={[{ borderBottomWidth: 1 }]}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={{ borderBottomWidth: 1 }}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TextInput
            style={{ borderBottomWidth: 1 }}
            placeholder="Name"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={{ borderBottomWidth: 1 }}
            placeholder="Surename"
            value={surename}
            onChangeText={setSurename}
          />
          <TextInput
            style={{ borderBottomWidth: 1 }}
            placeholder="Lastname"
            value={lastname}
            onChangeText={setLastname}
          />
        </View>
        <View style={{ marginTop: 20, gap: 10 }}>
          <Button
            title="Crear cuenta"
            onPress={handleRegister}
            color={theme.colors.primary}
          />

          <StyledText textCenter>
            ¿Ya tienes una cuenta?{" "}
            <StyledText
              fontWeight="bold"
              style={{ textDecorationLine: "underline" }}
              onPress={handleLogin}
              color={"primary"}
            >
              Inicia sesión
            </StyledText>
          </StyledText>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

export default Signup
