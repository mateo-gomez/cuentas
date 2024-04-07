import { StyleSheet, View } from "react-native"
import { Route, Routes as Router } from "react-router-native"
import Transaction from "./Pages/Transaction"
import Categories from "./Pages/Categories"
import NumPad from "./Pages/NumPad"
import Home from "./Pages/home"
import Category from "./Pages/category"

const Routes = () => {
  return (
    <View style={styles.container}>
      <Router>
        <Route path="/" element={<Home />} />
        {["/transactions/:type", "/transactions/:type/:id"].map((path) => (
          <Route key={path} path={path} element={<Transaction />}>
            <Route index element={<NumPad />} />
            <Route path="categories" element={<Categories />} />
          </Route>
        ))}
        <Route path="/categories/create" element={<Category />} />
        <Route path="/categories/:id" element={<Category />} />
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
