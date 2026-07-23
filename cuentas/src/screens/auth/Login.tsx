import { View, TextInput, StyleSheet } from "react-native"
import { useRef, useState } from "react"
import { useAuth } from "../../hooks/useAuth"
import {
  StyledText,
  ErrorBanner,
  AppLogo,
  AuthLayout,
  FormField,
  Button,
} from "../../Components"
import { useTheme, useThemedStyles } from "../../theme/index"
import type { Theme } from "../../theme/index"
import Link from "../../router/Link"
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
    <AuthLayout>
      <AppLogo size={88} style={styles.logo} />

      <View style={styles.header}>
        <StyledText fontSize="heading" fontWeight="bold">
          Inicia sesión
        </StyledText>
        <StyledText color="grey">Bienvenido de nuevo</StyledText>
      </View>

      <View style={styles.fields}>
        <FormField
          size="lg"
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => passwordRef.current?.focus()}
        />
        <FormField
          ref={passwordRef}
          size="lg"
          placeholder="Contraseña"
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
        <Button
          onPress={handleLogin}
          title="Iniciar sesión"
          loading={loading}
          disabled={loading}
        />
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
    </AuthLayout>
  )
}

const makeStyles = (_theme: Theme) =>
  StyleSheet.create({
    logo: {
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
