// crea una pantalla de inicio de sesión de usuario en inglés
import {
  View,
  TextInput,
  KeyboardAvoidingView,
  GestureResponderEvent,
  TouchableOpacity,
} from "react-native"
import { useState } from "react"
import { useAuth } from "../../hooks/useAuth"
import { StyledText } from "../../Components"
import { theme } from "../../theme"
import { useNavigate } from "react-router-native"

const Login = () => {
  const { login, error } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate()

  const handleLogin = async (event: GestureResponderEvent) => {
    event.preventDefault()

    try {
      await login({ email, password })
      navigate("/")
    } catch (error) {
      console.error("error al intentar login", error)
    }
  }

  const handleRegister = async () => {
    navigate("/register")
  }

  return (
    <KeyboardAvoidingView
      behavior="padding"
      style={{ justifyContent: "center", margin: 20, flex: 1 }}
    >
      <View>
        <View style={{ marginBottom: 20 }}>
          <StyledText fontSize="heading">Inicia sesión</StyledText>
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
        </View>
        <View style={{ marginTop: 20, gap: 10 }}>
          <TouchableOpacity
            onPress={handleLogin}
            style={{ backgroundColor: theme.colors.primary }}
          >
            <StyledText
              color="white"
              fontSize="subheading"
              style={{
                textAlign: "center",
                padding: 10,
                borderRadius: 5,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
              }}
            >
              Iniciar sesión
            </StyledText>
          </TouchableOpacity>
          <StyledText textCenter>
            ¿No tienes una cuenta?{" "}
            <StyledText
              onPress={handleRegister}
              color={"primary"}
              fontWeight="bold"
              style={{ textDecorationLine: "underline" }}
            >
              Registrate
            </StyledText>
          </StyledText>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

export default Login
