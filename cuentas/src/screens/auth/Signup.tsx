import {
  View,
  TextInput,
  KeyboardAvoidingView,
  StyleSheet,
  Platform,
  Image,
  ScrollView,
} from "react-native"
import { useRef, useState } from "react"
import { useAuth } from "../../hooks/useAuth"
import { StyledText, ErrorBanner } from "../../Components"
import { useTheme, useThemedStyles } from "../../theme/index"
import type { Theme } from "../../theme/index"
import Link from "../../router/Link"
import { StatusBar } from "expo-status-bar"
import { Button } from "../../Components/Button"
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
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <StatusBar style={theme.scheme === "dark" ? "light" : "dark"} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Image
            source={require("../../../assets/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />

          <View style={styles.header}>
            <StyledText fontSize="heading" fontWeight="bold">
              Crea tu cuenta
            </StyledText>
            <StyledText color="grey">
              Empezá a organizar tus finanzas
            </StyledText>
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
              autoComplete="new-password"
              returnKeyType="next"
              submitBehavior="submit"
              onSubmitEditing={() => nameRef.current?.focus()}
            />
            <TextInput
              ref={nameRef}
              style={styles.input}
              placeholder="Nombre"
              placeholderTextColor={theme.palette.ink4}
              value={name}
              onChangeText={setName}
              autoComplete="given-name"
              returnKeyType="next"
              submitBehavior="submit"
              onSubmitEditing={() => surenameRef.current?.focus()}
            />
            <TextInput
              ref={surenameRef}
              style={styles.input}
              placeholder="Segundo nombre"
              placeholderTextColor={theme.palette.ink4}
              value={surename}
              onChangeText={setSurename}
              autoComplete="additional-name"
              returnKeyType="next"
              submitBehavior="submit"
              onSubmitEditing={() => lastnameRef.current?.focus()}
            />
            <TextInput
              ref={lastnameRef}
              style={styles.input}
              placeholder="Apellido"
              placeholderTextColor={theme.palette.ink4}
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
              loading={loading}
              disabled={loading}
            >
              <StyledText textCenter color="white" fontWeight="bold">
                Registrarme
              </StyledText>
            </Button>

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
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.palette.bg,
    },
    scroll: {
      flexGrow: 1,
      justifyContent: "center",
      padding: 24,
    },
    card: {
      width: "100%",
      maxWidth: 420,
      alignSelf: "center",
    },
    logo: {
      width: 72,
      height: 72,
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

export default Signup
