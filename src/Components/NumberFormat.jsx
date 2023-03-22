import { formatNumber } from "../utils"
import StyledText from "./StyledText"

const NumberFormat = ({
    value = 0,
    fontWeight = "bold",
    color = "black",
    ...restOfProps
}) => {
    const absoluteValue = Math.abs(value)
    const formated = formatNumber(absoluteValue)

    return (
        <StyledText fontWeight={fontWeight} color={color} {...restOfProps}>
            {formated}
        </StyledText>
    )
}

export default NumberFormat
