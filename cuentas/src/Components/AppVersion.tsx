import Constants from "expo-constants"
import * as Updates from "expo-updates"
import { StyleSheet, View } from "react-native"
import { StyledText } from "./StyledText"

/**
 * Informational build/OTA version footer.
 *
 * - `version` is the marketing version from app.json (what the store shows).
 * - The OTA line reflects the running JS bundle: "base" when the embedded
 *   bundle is active, otherwise the short id of the applied EAS Update.
 */
export const AppVersion = () => {
  const version = Constants.expoConfig?.version ?? "—"

  const otaLabel = Updates.isEmbeddedLaunch
    ? "base"
    : Updates.updateId?.slice(0, 8) ?? "—"

  return (
    <View style={styles.container}>
      <StyledText color="secondary" fontSize="small" textCenter>
        v{version} · OTA {otaLabel}
      </StyledText>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: 16,
  },
})
