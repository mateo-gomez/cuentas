import {
  Collapse,
  CollapseBody,
  CollapseHeader,
} from "accordion-collapse-react-native"
import { Ionicons } from "@expo/vector-icons"
import { StyleSheet, View } from "react-native"
import { theme } from "../theme"
import { CategoriesOptions } from "./CategoriesOptions"
import { StyledText } from "./StyledText"
import { LogoutOption } from "./LogoutOption"

const options = [
  {
    title: "Categorías",
    icon: "grid-outline",
    options: <CategoriesOptions />,
  },
  // {
  //     title: "Cuentas",
  //     icon: "wallet-outline",
  //     options: <CategoriesOptions />,
  // },
  // {
  //     title: "Configuración",
  //     icon: "settings-outline",
  //     options: <CategoriesOptions />,
  // },
] as const

export const OptionsSideBar = () => (
  <View style={styles.container}>
    {options.map((option) => (
      <Collapse key={option.title}>
        <CollapseHeader>
          <View style={styles.touchable}>
            <View style={styles.iconContainer}>
              <Ionicons
                name={option.icon}
                color={theme.colors.primary}
                size={70}
              />
            </View>
            <StyledText textCenter fontSize={"subheading"} fontWeight={"bold"}>
              {option.title}
            </StyledText>
          </View>
        </CollapseHeader>
        <CollapseBody>{option.options}</CollapseBody>
      </Collapse>
    ))}

    <LogoutOption />
  </View>
)

const styles = StyleSheet.create({
  container: { flex: 1 },
  iconContainer: { alignItems: "center", padding: 10 },
  touchable: { padding: 20 },
})
