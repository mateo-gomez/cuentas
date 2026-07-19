import { useLocation, useNavigate } from "react-router"
import { Tab } from "../Components/BottomTabBar"

const pathToTab = (pathname: string): Tab => {
  if (pathname.startsWith("/accounts")) return "accounts"
  if (pathname.startsWith("/budget")) return "budget"
  if (pathname.startsWith("/profile")) return "profile"
  return "home"
}

const tabToPath: Record<Tab, string> = {
  home: "/",
  accounts: "/accounts",
  budget: "/budget",
  profile: "/profile",
}

/**
 * Derives the active bottom-tab from the current route and returns the
 * handlers each top-level screen needs to render `BottomTabBar`.
 */
export const useTabBar = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const activeTab = pathToTab(location.pathname)

  const onSelect = (tab: Tab) => {
    const path = tabToPath[tab]
    if (path !== location.pathname) {
      navigate(path)
    }
  }

  const onPressPlus = () => {
    navigate("/transactions/outcome")
  }

  return { activeTab, onSelect, onPressPlus }
}
