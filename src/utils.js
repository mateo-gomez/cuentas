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

export const groupTransactions = (data, key) => {
    const grouped = data.reduce((acc, item) => {
        const date = dateFormat(item[key], {
            day: "2-digit",
            month: "long",
        })
        const dataGroup = date in acc ? acc[date].data : []

        dataGroup.push(item)
        acc[date] = { title: date, data: dataGroup }

        return acc
    }, {})

    return Object.values(grouped)
}
