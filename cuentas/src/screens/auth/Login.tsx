import {
  View,
  TextInput,
  KeyboardAvoidingView,
  StyleSheet,
  Image,
  Platform,
} from "react-native"
import { useRef, useState } from "react"
import { useAuth } from "../../hooks/useAuth"
import { StyledText, ErrorBanner } from "../../Components"
import { useTheme, useThemedStyles } from "../../theme/index"
import type { Theme } from "../../theme/index"
import Link from "../../router/Link"
import { Button } from "../../Components/Button"
import { StatusBar } from "expo-status-bar"
import { createLogger } from "../../lib/logger"

const logger = createLogger("Login")

const Login = () => {
  const { theme } = useTheme()
  const styles = useThemedStyles(makeStyles)
  const { login, error } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const passwordRef = useRef<TextInput>(null)

  const handleLogin = async () => {
    if (loading) return
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
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <StatusBar style={theme.scheme === "dark" ? "light" : "dark"} />
      <View style={styles.card}>
        <Image
          source={require("../../../assets/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <View style={styles.header}>
          <StyledText fontSize="heading" fontWeight="bold">
            Inicia sesión
          </StyledText>
          <StyledText color="grey">Bienvenido de nuevo</StyledText>
        </View>

        <View style={styles.fields}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={theme.palette.ink4}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => passwordRef.current?.focus()}
          />
          <TextInput
            ref={passwordRef}
            style={styles.input}
            placeholder="Contraseña"
            placeholderTextColor={theme.palette.ink4}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
            returnKeyType="go"
            onSubmitEditing={handleLogin}
          />
        </View>

        <ErrorBanner message={error} />

        <View style={styles.actions}>
          <Button onPress={handleLogin} loading={loading} disabled={loading}>
            <StyledText color="white" fontWeight="bold" textCenter>
              Iniciar sesión
            </StyledText>
          </Button>
          <View style={styles.footer}>
            <StyledText color="grey">¿No tienes una cuenta? </StyledText>
            <Link to="/register" underlayColor={theme.palette.bg}>
              <StyledText
                color={"secondary"}
                fontWeight="bold"
                style={{ textDecorationLine: "underline" }}
              >
                Regístrate
              </StyledText>
            </Link>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      justifyContent: "center",
      padding: 24,
      flex: 1,
      backgroundColor: theme.palette.bg,
    },
    card: {
      width: "100%",
      maxWidth: 420,
      alignSelf: "center",
    },
    logo: {
      width: 88,
      height: 88,
      alignSelf: "center",
      marginBottom: 20,
    },
    header: {
      alignItems: "center",
      gap: 4,
      marginBottom: 28,
    },
    fields: {
      gap: 14,
    },
    input: {
      height: 52,
      paddingHorizontal: 16,
      color: theme.palette.ink,
      backgroundColor: theme.palette.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.palette.line,
      fontSize: 16,
    },
    actions: {
      marginTop: 24,
      gap: 16,
    },
    footer: {
      flexDirection: "row",
      justifyContent: "center",
    },
  })

export default Login
