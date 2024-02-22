const intlCurrency = new Intl.NumberFormat("es-CO", {
  maximumFractionDigits: 2,
})

export const formatNumber = (value: number | bigint) => {
  return intlCurrency.format(value) + " COP"
}
