import { NativeModules } from "react-native";
import { type Transaction } from "./Pages/Transaction";

const intlCurrency = new Intl.NumberFormat("es-CO", {
  maximumFractionDigits: 2,
});

export const formatNumber = (value: number | bigint) => {
  return intlCurrency.format(value) + " COP";
};

export const locale = () => {
  return NativeModules.I18nManager.localeIdentifier;
};

const deviceLanguage = locale().replace("_", "-").toLowerCase();

export const dateFormat = (
  date: Date,
  options: Intl.DateTimeFormatOptions | null = {
    day: "2-digit",
    weekday: "long",
    year: "numeric",
    month: "short",
  },
) => {
  return date.toLocaleDateString(deviceLanguage, options);
};

export interface GroupedTransaction {
  title: string;
  data: Transaction[];
}
export type AccGroupTransactions = {
  [x: string]: GroupedTransaction;
};

export const groupTransactions = (transactions: Transaction[], key: string) => {
  const grouped = transactions.reduce(
    (acc: AccGroupTransactions, item: Transaction): AccGroupTransactions => {
      const date = dateFormat(item[key], {
        day: "2-digit",
        month: "long",
      });
      const dataGroup: Transaction[] = date in acc ? acc[date].data : [];

      dataGroup.push(item);
      acc[date] = { title: date, data: dataGroup };

      return acc as AccGroupTransactions;
    },
    {},
  );

  return Object.values(grouped);
};

export const removeInitialSlash = (endpoint: string) => {
  return endpoint.at(0) === "/" ? endpoint.substring(1) : endpoint;
};
