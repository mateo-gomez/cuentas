import { NativeRouter } from "react-router-native"
import Routes from "./src/Routes"
import { StatusBar } from "expo-status-bar"
import { SafeAreaProvider } from "react-native-safe-area-context"

export default function App() {
  return (
    <NativeRouter>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Routes />
      </SafeAreaProvider>
    </NativeRouter>
  )
}
