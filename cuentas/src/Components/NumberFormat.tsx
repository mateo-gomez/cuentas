import { formatNumber } from "../utils"
import { StyledText, StyledTextProps } from "./StyledText"

export const NumberFormat = ({
  value = 0,
  fontSize = "body",
  fontWeight = "bold",
  color = "primary",
  ...restOfProps
}: StyledTextProps & { value: number }) => {
  const absoluteValue = Math.abs(value)
  const formatted = formatNumber(absoluteValue)

  return (
    <StyledText
      fontSize={fontSize}
      fontWeight={fontWeight}
      color={color}
      {...restOfProps}
    >
      {formatted}
    </StyledText>
  )
}
