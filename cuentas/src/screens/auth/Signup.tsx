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

const logger = createLogger("Signup")

const Signup = () => {
  const { theme } = useTheme()
  const styles = useThemedStyles(makeStyles)
  const { register, error } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [surename, setSurename] = useState("")
  const [lastname, setLastname] = useState("")
  const [loading, setLoading] = useState(false)

  const passwordRef = useRef<TextInput>(null)
  const nameRef = useRef<TextInput>(null)
  const surenameRef = useRef<TextInput>(null)
  const lastnameRef = useRef<TextInput>(null)

  const handleRegister = async () => {
    if (loading) return
    setLoading(true)
    try {
      await register({ email, password, name, surename, lastname })
    } catch (error) {
      logger.error("Register failed", { error })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout scroll>
      <AppLogo size={72} style={styles.logo} />

      <View style={styles.header}>
        <StyledText fontSize="heading" fontWeight="bold">
          Crea tu cuenta
        </StyledText>
        <StyledText color="grey">Empezá a organizar tus finanzas</StyledText>
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
          autoComplete="new-password"
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => nameRef.current?.focus()}
        />
        <FormField
          ref={nameRef}
          size="lg"
          placeholder="Nombre"
          value={name}
          onChangeText={setName}
          autoComplete="given-name"
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => surenameRef.current?.focus()}
        />
        <FormField
          ref={surenameRef}
          size="lg"
          placeholder="Segundo nombre"
          value={surename}
          onChangeText={setSurename}
          autoComplete="additional-name"
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => lastnameRef.current?.focus()}
        />
        <FormField
          ref={lastnameRef}
          size="lg"
          placeholder="Apellido"
          value={lastname}
          onChangeText={setLastname}
          autoComplete="family-name"
          returnKeyType="go"
          onSubmitEditing={handleRegister}
        />
      </View>

      <ErrorBanner message={error} />

      <View style={styles.actions}>
        <Button
          onPress={handleRegister}
          title="Registrarme"
          loading={loading}
          disabled={loading}
        />

        <View style={styles.footer}>
          <StyledText color="grey">¿Ya tienes una cuenta? </StyledText>
          <Link to="/login" underlayColor={theme.palette.bg}>
            <StyledText
              color={"secondary"}
              fontWeight="bold"
              style={{ textDecorationLine: "underline" }}
            >
              Inicia sesión
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

export default Signup
