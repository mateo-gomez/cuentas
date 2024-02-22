import { NativeRouter } from "react-router-native"
import Routes from "./src/Routes"

export default function App() {
  return (
    <NativeRouter>
      <Routes />
    </NativeRouter>
  )
}
