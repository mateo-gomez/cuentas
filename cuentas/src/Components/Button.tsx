import { GestureResponderEvent, Pressable, StyleSheet } from "react-native"
import { theme } from "../theme"
import { useState } from "react"

interface ButtonProps {
  onPress: (event: GestureResponderEvent) => void
  children: React.ReactNode
}

export const Button = ({ onPress, children, ...rest }: ButtonProps) => {
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

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      style={[styles.button, isPressed && styles.buttonPressed]}
      {...rest}
    >
      {children}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: theme.colors.primary,
    textAlign: "center",
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
})
