const intlCurrency = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumSignificantDigits: 2,
    currencyDisplay: "code",
})

export const formatNumber = (value) => {
    return intlCurrency.format(value)
}
