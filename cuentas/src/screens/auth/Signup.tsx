import {
  View,
  TextInput,
  KeyboardAvoidingView,
  StyleSheet,
  Platform,
} from "react-native"
import { useState } from "react"
import { useAuth } from "../../hooks/useAuth"
import { StyledText } from "../../Components"
import { theme } from "../../theme"
import { Link } from "react-router-native"
import { StatusBar } from "expo-status-bar"
import { Button } from "../../Components/Button"

const Signup = () => {
  const { register, error } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [surename, setSurename] = useState("")
  const [lastname, setLastname] = useState("")

  const handleRegister = async () => {
    try {
      await register({ email, password, name, surename, lastname })
    } catch (error) {
      console.error("error al intentar registrar", error)
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <StatusBar style="dark" />
      <View>
        <View style={{ marginBottom: 20 }}>
          <StyledText fontSize="heading">Crea tu cuenta</StyledText>
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
          <TextInput
            style={styles.input}
            placeholder="Name"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Surename"
            value={surename}
            onChangeText={setSurename}
          />
          <TextInput
            style={styles.input}
            placeholder="Lastname"
            value={lastname}
            onChangeText={setLastname}
          />
        </View>
        <View style={{ marginTop: 20, gap: 10 }}>
          <Button onPress={handleRegister}>
            <StyledText textCenter color="white" fontWeight="bold">
              Registrarme
            </StyledText>
          </Button>

          <View style={{ flexDirection: "row", justifyContent: "center" }}>
            <StyledText>¿Ya tienes una cuenta? </StyledText>
            <Link to="/register" underlayColor={theme.colors.highlight}>
              <StyledText
                color={"primary"}
                fontWeight="bold"
                style={{ textDecorationLine: "underline" }}
              >
                Inicia sesión
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

export default Signup
