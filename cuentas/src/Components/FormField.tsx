import { forwardRef } from "react"
import {
  View,
  TextInput,
  TextInputProps,
  StyleProp,
  ViewStyle,
} from "react-native"
import { useTheme, useThemedStyles } from "../theme/index"
import type { Theme } from "../theme/index"
import { StyledText } from "./StyledText"
import { ErrorBanner } from "./ErrorBanner"

interface FormFieldProps extends TextInputProps {
  label?: string
  error?: string | null
  // "lg" is the taller auth-style input (height 52); "md" is the default
  // padded input used across the rest of the app.
  size?: "md" | "lg"
  containerStyle?: StyleProp<ViewStyle>
}

// Canonical themed text input: owns the input recipe (surface bg, line border,
// rounded), the label, and the default placeholder color. Forwards the ref so
// callers keep focus-chaining (onSubmitEditing -> next.focus()).
export const FormField = forwardRef<TextInput, FormFieldProps>(
  ({ label, error, size = "md", containerStyle, style, ...rest }, ref) => {
    const { theme } = useTheme()
    const styles = useThemedStyles(makeStyles)

    return (
      <View style={containerStyle}>
        {label ? <StyledText style={styles.label}>{label}</StyledText> : null}
        <TextInput
          ref={ref}
          style={[styles.input, size === "lg" && styles.inputLg, style]}
          placeholderTextColor={theme.palette.ink4}
          {...rest}
        />
        {error ? <ErrorBanner message={error} /> : null}
      </View>
    )
  },
)

FormField.displayName = "FormField"

const makeStyles = (theme: Theme) => ({
  label: {
    fontFamily: theme.fonts.sans,
    fontSize: 13,
    color: theme.palette.ink3,
    marginBottom: 6,
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: theme.palette.ink,
    backgroundColor: theme.palette.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.palette.line,
    fontSize: 16,
  },
  inputLg: {
    height: 52,
    paddingVertical: 0,
  },
})
