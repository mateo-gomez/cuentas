import { View, Pressable } from "react-native"
import { useThemedStyles } from "../theme/index"
import type { Theme } from "../theme/index"
import { StyledText } from "./StyledText"

interface SegmentOption<T extends string> {
  label: string
  value: T
}

interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[]
  value: T
  onChange: (value: T) => void
}

// Two-plus option toggle (e.g. income/expense). Replaces the hand-rolled
// typeToggle segmented controls across screens.
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  const styles = useThemedStyles(makeStyles)

  return (
    <View style={styles.track}>
      {options.map((option) => {
        const active = option.value === value
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[styles.option, active && styles.optionActive]}
          >
            <StyledText
              color={active ? "white" : "grey"}
              fontWeight={active ? "bold" : "400"}
              textCenter
            >
              {option.label}
            </StyledText>
          </Pressable>
        )
      })}
    </View>
  )
}

const makeStyles = (theme: Theme) => ({
  track: {
    flexDirection: "row" as const,
    backgroundColor: theme.palette.surface2,
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  option: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center" as const,
  },
  optionActive: {
    backgroundColor: theme.palette.accent,
  },
})
