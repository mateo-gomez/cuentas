import { useEffect } from "react"
import AppRouter from "./src/router/AppRouter"
import Routes from "./src/Routes"
import { StatusBar } from "expo-status-bar"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { AuthProvider } from "./src/contexts/AuthContext"
import { ConfirmProvider } from "./src/contexts/ConfirmContext"
import { ThemeProvider, useTheme } from "./src/theme/index"
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

function ThemedStatusBar() {
  const { theme } = useTheme()
  return <StatusBar style={theme.scheme === "dark" ? "light" : "dark"} />
}

function AppShell({ themeReady }: { themeReady: boolean }) {
  return (
    <AuthProvider>
      <ConfirmProvider>
        <ThemedStatusBar />
        <Routes />
      </ConfirmProvider>
    </AuthProvider>
  )
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  })

  return (
    <ThemeProvider>
      <AppBoot fontsLoaded={fontsLoaded} fontError={fontError} />
    </ThemeProvider>
  )
}

function AppBoot({ fontsLoaded, fontError }: { fontsLoaded: boolean; fontError: Error | null }) {
  const { ready: themeReady } = useTheme()

  useEffect(() => {
    if ((fontsLoaded || fontError) && themeReady) {
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded, fontError, themeReady])

  // Keep the splash up until fonts AND theme hydration resolve so text and
  // colors never flash a fallback state.
  if (!fontsLoaded && !fontError) {
    return null
  }
  if (!themeReady) {
    return null
  }

  return (
    <AppRouter>
      <SafeAreaProvider>
        <AppShell themeReady={themeReady} />
      </SafeAreaProvider>
      <Toast />
    </AppRouter>
  )
}
