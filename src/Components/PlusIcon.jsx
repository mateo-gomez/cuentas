import { Path, Svg } from "react-native-svg"

const PlusIcon = ({ size = 50, color = "#000" }) => {
    return (
        <Svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill={color}
        >
            <Path d="M13 12h3.5a.5.5 0 1 1 0 1H13v3.5a.5.5 0 1 1-1 0V13H8.5a.5.5 0 1 1 0-1H12V8.5a.5.5 0 1 1 1 0V12Zm-.5 11C6.701 23 2 18.299 2 12.5S6.701 2 12.5 2 23 6.701 23 12.5 18.299 23 12.5 23Zm0-1a9.5 9.5 0 1 0 0-19 9.5 9.5 0 0 0 0 19Z" />
        </Svg>
    )
}

export default PlusIcon
