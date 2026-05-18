import { Alert, BackHandler, StyleSheet, View } from "react-native"
import {
  Route,
  Routes as Router,
  useLocation,
  useNavigate,
} from "react-router-native"
import Transaction from "./screens/transaction"
import Categories from "./screens/transaction/Categories"
import NumPad from "./screens/transaction/NumPad"
import Home from "./screens/home"
import Category from "./screens/category"
import Login from "./screens/auth/Login"
import PrivateRoutes from "./PrivateRoutes"
import Signup from "./screens/auth/Signup"
import { useEffect } from "react"
import Import from "./screens/import"
import BudgetScreen from "./screens/budget"
import BudgetEdit from "./screens/budget/Edit"

const Routes = () => {
  const navigate = useNavigate()
  const location = useLocation()

  // useEffect(() => {
  //   const handleBackPress = () => {
  //     if (location.pathname === "/") {
  //       Alert.alert(
  //         "Salir",
  //         "¿Desea salir de la app?",
  //         [
  //           {
  //             text: "Cancelar",
  //             style: "cancel",
  //           },
  //           {
  //             text: "Salir",
  //             onPress: () => BackHandler.exitApp(),
  //           },
  //         ],
  //         { cancelable: true },
  //       )
  //     } else {
  //       navigate(-1)
  //     }

  //     return true
  //   }

  //   BackHandler.addEventListener("hardwareBackPress", handleBackPress)

  //   return () => {
  //     // BackHandler.exitApp()
  //   }
  // }, [navigate, location])

  return (
    <View style={styles.container}>
      <Router>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Signup />} />
        <Route element={<PrivateRoutes />}>
          <Route path="/" element={<Home />} />
          {["/transactions/:type", "/transactions/:type/:id"].map((path) => (
            <Route key={path} path={path} element={<Transaction />}>
              <Route index element={<NumPad />} />
              <Route path="categories" element={<Categories />} />
            </Route>
          ))}
          <Route path="/categories/create" element={<Category />} />
          <Route path="/categories/:id" element={<Category />} />
          <Route path="/import" element={<Import />} />
          <Route path="/budget" element={<BudgetScreen />} />
          <Route path="/budget/edit" element={<BudgetEdit />} />
        </Route>
      </Router>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexGrow: 1,
  },
})

export default Routes
