import {
  DrawerLayoutAndroid,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native"
import { useNavigate } from "react-router-native"
import { theme } from "../../theme"
import { useRef, useState } from "react"
import { Ionicons } from "@expo/vector-icons"

import { AppBar, OptionsSideBar } from "../../Components"
import { Logo } from "../../Components/Logo"
import Transactions from "./Transactions"
import { useDateRange } from "../../hooks/useDateRange"
import { monthRange } from "../../utils"

const now = new Date()

const initialSteps = [
  {
    id: "3",
    ...monthRange(now.getFullYear(), now.getMonth()),
  },
  {
    id: "2",
    ...monthRange(now.getFullYear(), now.getMonth() - 1),
  },
  {
    id: "1",
    ...monthRange(now.getFullYear(), now.getMonth() - 2),
  },
]

const Home = () => {
  const { dateRange: totalDateRange } = useDateRange()
  const [steps, setSteps] = useState(initialSteps)
  const navigate = useNavigate()
  const drawerRef = useRef(null)

  const handlePressPlusButton = () => {
    navigate("/transactions/income")
  }

  const handlePressMinusButton = () => {
    navigate("/transactions/outcome")
  }

  const onEndReached = () => {
    console.log("on end reached")
    const currentStep = steps.at(-1)

    if (totalDateRange?.start < currentStep.start) {
      const { start, end } = monthRange(
        currentStep.start.getFullYear(),
        currentStep.start.getMonth() - 1,
      )

      const newPage = {
        id: Date.now().toString(),
        start,
        end,
      }

      setSteps((prevStates) => [...prevStates, newPage])
    }
  }

  const onStartReached = () => {
    const currentStep = steps.at(0)

    if (totalDateRange?.end > currentStep.end) {
      const { start, end } = monthRange(
        currentStep.start.getFullYear(),
        currentStep.start.getMonth() + 1,
      )

      const newPage = {
        id: Date.now().toString(),
        start,
        end,
      }

      setSteps((prevStates) => [...prevStates, newPage])
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <AppBar>
        <Logo />
      </AppBar>
      <DrawerLayoutAndroid
        ref={drawerRef}
        drawerPosition="right"
        drawerWidth={300}
        renderNavigationView={OptionsSideBar}
      >
        <View style={styles.main}>
          <FlatList
            data={steps}
            renderItem={({ item }) => (
              <Transactions start={item.start} end={item.end} />
            )}
            pagingEnabled
            horizontal
            inverted
            initialNumToRender={5}
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            onStartReached={onStartReached}
            onEndReached={onEndReached}
            onEndReachedThreshold={1}
            onStartReachedThreshold={1}
          />

          <View style={styles.buttons}>
            <TouchableOpacity onPress={handlePressMinusButton}>
              <Ionicons
                name="remove-circle-outline"
                color={theme.colors.red}
                size={120}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={handlePressPlusButton}>
              <Ionicons
                name="add-circle-outline"
                color={theme.colors.greenLight}
                size={120}
              />
            </TouchableOpacity>
          </View>
        </View>
      </DrawerLayoutAndroid>
    </View>
  )
}

const styles = StyleSheet.create({
  main: {
    justifyContent: "space-between",
    flex: 1,
  },
  buttons: {
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "space-around",
    flexDirection: "row",
  },
})

export default Home
