import { ReactNode } from "react"
import { StyleSheet, View } from "react-native"

// On native the app already fills the device screen, so the shell is a
// transparent passthrough. The web build swaps in the centered-column layout.
export default function Shell({ children }: { children: ReactNode }) {
  return <View style={styles.fill}>{children}</View>
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
})
