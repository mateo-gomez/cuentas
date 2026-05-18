import { View, TextInput, KeyboardAvoidingView, StyleSheet } from "react-native"
import { useState } from "react"
import { useAuth } from "../../hooks/useAuth"
import { StyledText, ErrorBanner } from "../../Components"
import { theme } from "../../theme"
import { Link } from "react-router-native"
import { Button } from "../../Components/Button"
import { StatusBar } from "expo-status-bar"
import { createLogger } from "../../lib/logger"

const logger = createLogger("Login")

const Login = () => {
  const { login, error } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    try {
      await login({ email, password })
    } catch (error) {
      logger.error("Login failed", { error })
    } finally {
      setLoading(false)
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
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <ErrorBanner message={error} />

        <View style={{ marginTop: 20, gap: 10 }}>
          <Button onPress={handleLogin} loading={loading} disabled={loading}>
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
