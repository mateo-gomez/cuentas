import { NativeRouter } from "react-router-native"
import Routes from "./src/Routes"
import { StatusBar } from "expo-status-bar"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { AuthProvider } from "./src/contexts/AuthContext"

export default function App() {
  return (
    <NativeRouter>
      <SafeAreaProvider>
        <AuthProvider>
          <StatusBar style="light" />
          <Routes />
        </AuthProvider>
      </SafeAreaProvider>
    </NativeRouter>
  )
}
