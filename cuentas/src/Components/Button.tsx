import {
  ActivityIndicator,
  GestureResponderEvent,
  Pressable,
} from "react-native"
import { useTheme, useThemedStyles } from "../theme/index"
import type { Theme } from "../theme/index"
import { useState } from "react"

interface ButtonProps {
  onPress: (event: GestureResponderEvent) => void
  children: React.ReactNode
  disabled?: boolean
  loading?: boolean
}

export const Button = ({
  onPress,
  children,
  disabled,
  loading,
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

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={isDisabled}
      style={[
        styles.button,
        isPressed && styles.buttonPressed,
        isDisabled && styles.buttonDisabled,
      ]}
      {...rest}
    >
      {loading ? <ActivityIndicator color={theme.palette.onAccent} /> : children}
    </Pressable>
  )
}

const makeStyles = (theme: Theme) => ({
  button: {
    backgroundColor: theme.palette.accent,
    textAlign: "center" as const,
    padding: 10,
    borderRadius: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonPressed: {
    opacity: 0.5,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
})
