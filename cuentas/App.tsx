import { useEffect } from "react"
import AppRouter from "./src/router/AppRouter"
import Routes from "./src/Routes"
import { StatusBar } from "expo-status-bar"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { AuthProvider } from "./src/contexts/AuthContext"
import { ConfirmProvider } from "./src/contexts/ConfirmContext"
import Toast from "react-native-toast-message"
import { injectA11yStyles } from "./src/utils/injectA11yStyles"
import * as SplashScreen from "expo-splash-screen"
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter"

injectA11yStyles()

SplashScreen.preventAutoHideAsync()

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  })

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded, fontError])

  // Keep the splash up until fonts resolve so text never flashes in a
  // fallback family. On error we still render (fonts fall back gracefully).
  if (!fontsLoaded && !fontError) {
    return null
  }

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
