import { BackHandler, Platform, ToastAndroid } from "react-native"
import { Route, Routes as Router, useLocation, useNavigate } from "react-router"
import Transaction from "./screens/transaction"
import Categories from "./screens/transaction/Categories"
import NumPad from "./screens/transaction/NumPad"
import Home from "./screens/home"
import Category from "./screens/category"
import CategoryList from "./screens/category/List"
import Account from "./screens/account"
import AccountsList from "./screens/account/List"
import AccountTransfer from "./screens/account/Transfer"
import Login from "./screens/auth/Login"
import PrivateRoutes from "./PrivateRoutes"
import Signup from "./screens/auth/Signup"
import { useEffect, useRef } from "react"
import Import from "./screens/import"
import PdfImportReview from "./screens/pdfImport"
import BudgetScreen from "./screens/budget"
import BudgetEdit from "./screens/budget/Edit"
import Profile from "./screens/profile"
import Settings from "./screens/profile/Settings"
import Shell from "./Components/Shell/Shell"

const DOUBLE_BACK_DELAY = 2000

const Routes = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const lastBackPress = useRef(0)

  useEffect(() => {
    const handleBackPress = () => {
      // On Home, require a double back press to exit the app.
      if (location.pathname === "/") {
        const now = Date.now()
        if (now - lastBackPress.current < DOUBLE_BACK_DELAY) {
          BackHandler.exitApp()
          return true
        }
        lastBackPress.current = now
        if (Platform.OS === "android") {
          ToastAndroid.show(
            "Presione nuevamente para salir",
            ToastAndroid.SHORT,
          )
        }
        return true
      }

      // Anywhere else, go back to the previous route.
      navigate(-1)
      return true
    }

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackPress,
    )

    return () => subscription.remove()
  }, [navigate, location.pathname])

  return (
    <Shell>
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
          <Route path="/categories" element={<CategoryList />} />
          <Route path="/categories/create" element={<Category />} />
          <Route path="/categories/:id" element={<Category />} />
          <Route path="/accounts" element={<AccountsList />} />
          <Route path="/accounts/create" element={<Account />} />
          {/* MUST stay before "/:id" — else "transfer" parses as an account id. */}
          <Route path="/accounts/transfer" element={<AccountTransfer />} />
          <Route path="/accounts/:id" element={<Account />} />
          <Route path="/import" element={<Import />} />
          <Route path="/import/pdf" element={<PdfImportReview />} />
          <Route path="/budget" element={<BudgetScreen />} />
          <Route path="/budget/edit" element={<BudgetEdit />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/settings/profile" element={<Profile />} />
        </Route>
      </Router>
    </Shell>
  )
}

export default Routes
