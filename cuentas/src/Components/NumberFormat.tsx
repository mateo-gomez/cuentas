import { formatNumber } from "../utils"
import StyledText from "./StyledText"

const NumberFormat = ({
  value = 0,
  fontSize = "body",
  fontWeight = "bold",
  color = "black",
  ...restOfProps
}) => {
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
