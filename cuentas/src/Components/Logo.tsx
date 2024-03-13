import { View } from "react-native"
import { LogoIcon } from "./svg/LogoIcon"
import { StyledText } from "./StyledText"

export const Logo = () => {
  return (
    <View style={{ flexDirection: "row", gap: 5 }}>
      <LogoIcon size={20} color="white" />
      <StyledText color={"white"} fontWeight="bold">
        Cuentas
      </StyledText>
    </View>
  )
}
