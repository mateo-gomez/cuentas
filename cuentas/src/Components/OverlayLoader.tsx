import { ActivityIndicator, Modal, StyleSheet, View } from "react-native"
import { StyledText } from "./StyledText"
import grafito from "../theme"

interface OverlayLoaderProps {
  message?: string
}

export const OverlayLoader = ({ message }: OverlayLoaderProps) => {
  return (
    <Modal transparent={true}>
      <View style={styles.indicatorContainer}>
        <ActivityIndicator
          style={styles.indicator}
          size={"large"}
          color={grafito.accent}
        />
        <StyledText color="white">{message}</StyledText>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  indicatorContainer: {
    flex: 1,
    gap: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(100, 100, 100, 0.7)",
  },
  indicator: {
    backgroundColor: grafito.surface,
    padding: 16,
    borderRadius: 12,
  },
})
