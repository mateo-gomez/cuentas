import { theme } from "../theme"
import { formatNumber } from "../utils"
import StyledText, { StyledTextProps } from "./StyledText"

const NumberFormat = ({
  value = 0,
  fontSize = "body",
  fontWeight = "bold",
  color = "primary",
  ...restOfProps
}: StyledTextProps & { value: number }) => {
  const absoluteValue = Math.abs(value)
  const formated = formatNumber(absoluteValue)

  return (
    <StyledText
      fontSize={fontSize}
      fontWeight={fontWeight}
      color={color}
      {...restOfProps}
    >
      {formated}
    </StyledText>
  )
}

export default NumberFormat
