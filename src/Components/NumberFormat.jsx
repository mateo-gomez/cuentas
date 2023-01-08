import { formatNumber } from "../utils"
import StyledText from "./StyledText"

const NumberFormat = ({ value = 0, fontWeight = "bold", ...restOfProps }) => {
    const color = value < 0 ? "red" : "secondary"
    const absoluteValue = Math.abs(value)
    const formated = formatNumber(absoluteValue)

    return (
        <StyledText fontWeight={fontWeight} color={color} {...restOfProps}>
            {formated}
        </StyledText>
    )
}

export default NumberFormat
