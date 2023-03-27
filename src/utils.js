import { NativeModules } from "react-native"

const intlCurrency = new Intl.NumberFormat("es-CO", {
    maximumFractionDigits: 2,
})

export const formatNumber = (value) => {
    return intlCurrency.format(value) + " COP"
}

export const locale = () => {
    return NativeModules.I18nManager.localeIdentifier
}

const deviceLanguage = locale().replace("_", "-").toLowerCase()

export const dateFormat = (
    date,
    options = {
        day: "2-digit",
        weekday: "long",
        year: "numeric",
        month: "short",
    },
) => {
    return date.toLocaleDateString(deviceLanguage, options)
}

}
