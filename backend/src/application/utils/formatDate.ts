export const formatDate = (
  date: Date,
  options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    weekday: "long",
    year: "numeric",
    month: "short",
  },
) => {
  return date.toLocaleDateString("es", options);
};
