import {
  ActivityIndicator,
  GestureResponderEvent,
  Pressable,
  StyleProp,
  ViewStyle,
} from "react-native"
import { useTheme, useThemedStyles } from "../theme/index"
import type { Theme } from "../theme/index"
import { useState } from "react"
import { StyledText } from "./StyledText"

export type ButtonVariant = "primary" | "pill" | "danger-outline"

interface ButtonProps {
  onPress: (event: GestureResponderEvent) => void
  children?: React.ReactNode
  // Convenience: renders a centered themed label so callers don't repeat
  // <Button><StyledText.../></Button>. Ignored when children are provided.
  title?: string
  variant?: ButtonVariant
  disabled?: boolean
  loading?: boolean
  style?: StyleProp<ViewStyle>
}

export const Button = ({
  onPress,
  children,
  title,
  variant = "primary",
  disabled,
  loading,
  style,
  ...rest
}: ButtonProps) => {
  const { theme } = useTheme()
  const styles = useThemedStyles(makeStyles)
  const [isPressed, setIsPressed] = useState(false)

  const handlePressIn = () => {
    setIsPressed(true)
  }

  const handlePressOut = () => {
    setIsPressed(false)
  }

  const handlePress = (event: GestureResponderEvent) => {
    event.preventDefault()
    onPress(event)
  }

  const isDisabled = disabled || loading
  const isOutline = variant === "danger-outline"

  const label =
    title !== undefined ? (
      <StyledText
        color={isOutline ? "red" : "white"}
        fontWeight="bold"
        textCenter
      >
        {title}
      </StyledText>
    ) : (
      children
    )

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={isDisabled}
      style={[
        styles.button,
        variant === "primary" && styles.primary,
        variant === "pill" && styles.pill,
        variant === "danger-outline" && styles.dangerOutline,
        isPressed && styles.buttonPressed,
        isDisabled && styles.buttonDisabled,
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          color={isOutline ? theme.palette.neg : theme.palette.onAccent}
        />
      ) : (
        label
      )}
    </Pressable>
  )
}

const makeStyles = (theme: Theme) => ({
  button: {
    padding: 12,
    borderRadius: 12,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  primary: {
    backgroundColor: theme.palette.accent,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  pill: {
    backgroundColor: theme.palette.accent,
    borderRadius: 999,
    paddingHorizontal: 20,
  },
  dangerOutline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: theme.palette.neg,
  },
  buttonPressed: {
    opacity: 0.5,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
})
