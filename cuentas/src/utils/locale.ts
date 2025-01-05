import { I18nManager } from "react-native"

export const locale = () => {
  return I18nManager.getConstants().localeIdentifier
}
