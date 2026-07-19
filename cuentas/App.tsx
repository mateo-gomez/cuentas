import AppRouter from "./src/router/AppRouter"
import Routes from "./src/Routes"
import { StatusBar } from "expo-status-bar"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { AuthProvider } from "./src/contexts/AuthContext"
import { ConfirmProvider } from "./src/contexts/ConfirmContext"
import Toast from "react-native-toast-message"
import { injectA11yStyles } from "./src/utils/injectA11yStyles"

injectA11yStyles()

export default function App() {
  return (
    <AppRouter>
      <SafeAreaProvider>
        <AuthProvider>
          <ConfirmProvider>
            <StatusBar style="light" />
            <Routes />
          </ConfirmProvider>
        </AuthProvider>
      </SafeAreaProvider>
      <Toast />
    </AppRouter>
  )
}
