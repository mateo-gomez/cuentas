// crea una pantalla de inicio de sesión de usuario en inglés
import { View, TextInput, KeyboardAvoidingView, StyleSheet } from "react-native"
import { useState } from "react"
import { useAuth } from "../../hooks/useAuth"
import { StyledText } from "../../Components"
import { theme } from "../../theme"
import { Link } from "react-router-native"
import { Button } from "../../Components/Button"
import { StatusBar } from "expo-status-bar"

const Login = () => {
  const { login, error } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = async () => {
    try {
      await login({ email, password })
    } catch (error) {
      console.error("error al intentar login", error)
    }
  }

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.container}>
      <StatusBar style="dark" />
      <View>
        <View style={{ marginBottom: 20 }}>
          <StyledText fontSize="heading">Inicia sesión</StyledText>
        </View>

        <View style={{ gap: 20 }}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>
        <View style={{ marginTop: 20, gap: 10 }}>
          <Button onPress={handleLogin}>
            <StyledText color="white" fontWeight="bold" textCenter>
              Iniciar sesión
            </StyledText>
          </Button>
          <View style={{ flexDirection: "row", justifyContent: "center" }}>
            <StyledText>¿No tienes una cuenta? </StyledText>
            <Link to="/register" underlayColor={theme.colors.highlight}>
              <StyledText
                color={"primary"}
                fontWeight="bold"
                style={{ textDecorationLine: "underline" }}
              >
                Registrate
              </StyledText>
            </Link>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    padding: 40,
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  input: {
    padding: 10,
    backgroundColor: theme.colors.white,
    borderRadius: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
})

export default Login
