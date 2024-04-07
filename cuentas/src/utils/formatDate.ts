import { locale } from "./locale"

const deviceLanguage = locale().replace("_", "-").toLowerCase()

export const formatDate = (
  date: Date,
  options: Intl.DateTimeFormatOptions | null = {
    day: "2-digit",
    weekday: "long",
    year: "numeric",
    month: "short",
  },
) => {
  return date.toLocaleDateString(deviceLanguage, options)
}

export const monthYearFormatter = (date: Date) => {
  return formatDate(date, {
    day: "2-digit",
    year: "numeric",
    month: "short",
  })
}
