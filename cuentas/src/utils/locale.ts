import { NativeModules } from "react-native"

export const locale = () => {
  return NativeModules.I18nManager.localeIdentifier
}
