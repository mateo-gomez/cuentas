const intlCurrency = new Intl.NumberFormat("es-CO", {
    maximumSignificantDigits: 2,
})

export const formatNumber = (value) => {
    return intlCurrency.format(value) + " COP"
}
