import { ActivityIndicator, Modal, View } from "react-native"
import { StyledText } from "./StyledText"
import { useTheme, useThemedStyles } from "../theme/index"
import type { Theme } from "../theme/index"

interface OverlayLoaderProps {
  message?: string
}

export const OverlayLoader = ({ message }: OverlayLoaderProps) => {
  const { theme } = useTheme()
  const styles = useThemedStyles(makeStyles)
  return (
    <Modal transparent={true}>
      <View style={styles.indicatorContainer}>
        <ActivityIndicator
          style={styles.indicator}
          size={"large"}
          color={theme.palette.accent}
        />
        <StyledText color="white">{message}</StyledText>
      </View>
    </Modal>
  )
}

const makeStyles = (theme: Theme) => ({
  indicatorContainer: {
    flex: 1,
    gap: 10,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    backgroundColor: "rgba(100, 100, 100, 0.7)",
  },
  indicator: {
    backgroundColor: theme.palette.surface,
    padding: 16,
    borderRadius: 12,
  },
})
