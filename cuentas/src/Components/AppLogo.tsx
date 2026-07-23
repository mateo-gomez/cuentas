import { Image, ImageStyle, StyleProp } from "react-native"

interface AppLogoProps {
  size?: number
  style?: StyleProp<ImageStyle>
}

// The PNG brand logo used on auth screens and the Home header. Distinct from
// the SVG wordmark in Logo.tsx.
export const AppLogo = ({ size = 88, style }: AppLogoProps) => {
  return (
    <Image
      source={require("../../assets/logo.png")}
      style={[{ width: size, height: size, alignSelf: "center" }, style]}
      resizeMode="contain"
    />
  )
}
