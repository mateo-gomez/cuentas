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
