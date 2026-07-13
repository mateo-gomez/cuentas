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
import { AppVersion } from "./AppVersion"
import { Link } from "react-router-native"

const options = [
  {
    title: "Categorías",
    icon: "grid-outline",
    options: <CategoriesOptions />,
  },
  {
    title: "Importar transacciones",
    icon: "cloud-upload-outline",
    to: "/import",
  },
  {
    title: "Cuentas",
    icon: "wallet-outline",
    to: "/accounts",
  },
  // {
  //     title: "Configuración",
  //     icon: "settings-outline",
  //     options: <CategoriesOptions />,
  // },
]

export const OptionsSideBar = () => (
  <View style={styles.container}>
    {options.map((option) =>
      option.options ? (
        <Collapse key={option.title}>
          <CollapseHeader>
            <View style={styles.touchable}>
              <View style={styles.iconContainer}>
                <Ionicons
                  name={option.icon as any}
                  color={theme.colors.primary}
                  size={70}
                />
              </View>
              <StyledText
                textCenter
                fontSize={"subheading"}
                fontWeight={"bold"}
              >
                {option.title}
              </StyledText>
            </View>
          </CollapseHeader>
          <CollapseBody>{option.options}</CollapseBody>
        </Collapse>
      ) : (
        <Link to={option.to} key={option.title}>
          <View style={styles.touchable}>
            <View style={styles.iconContainer}>
              <Ionicons
                name={option.icon as any}
                color={theme.colors.primary}
                size={70}
              />
            </View>
            <StyledText textCenter fontSize={"subheading"} fontWeight={"bold"}>
              {option.title}
            </StyledText>
          </View>
        </Link>
      ),
    )}

    <LogoutOption />
    <AppVersion />
  </View>
)

const styles = StyleSheet.create({
  container: { flex: 1 },
  iconContainer: { alignItems: "center", padding: 10 },
  touchable: { padding: 20 },
})
