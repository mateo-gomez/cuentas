import {
  Collapse,
  CollapseBody,
  CollapseHeader,
} from "accordion-collapse-react-native";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import StyledText from "./StyledText";
import TransactionItem from "./TransactionItem";
import { NavArrowDown, NavArrowUp } from "iconoir-react-native";
import { theme } from "../theme";
import NumberFormat from "./NumberFormat";
import { type Transaction } from "../Pages/Transaction";

export interface TransactionsAccordionProps {
  title: string;
  transactions: Transaction[];
}

export const TransactionsAccordion = (
  { title, transactions }: TransactionsAccordionProps,
) => {
  const [expanded, setExpanded] = useState(true);
  const toggleCollapse = () => {
    setExpanded((expanded) => !expanded);
  };

  const total = transactions.reduce((sum, transaction) => {
    const value = Number(transaction.value) * (transaction.type ? 1 : -1);

    return sum + value;
  }, 0);

  return (
    <Collapse isExpanded={expanded} onToggle={toggleCollapse}>
      <CollapseHeader style={styles.headerContainer}>
        <View style={styles.headerPrice}>
          {expanded
            ? (
              <NavArrowUp
                color={theme.colors.grey}
                height={20}
                width={20}
              />
            )
            : (
              <NavArrowDown
                color={theme.colors.grey}
                height={20}
                width={20}
              />
            )}
          <StyledText fontWeight={"bold"}>{title}</StyledText>
        </View>
        <NumberFormat
          value={total}
          color={total > 0 ? "green" : "red"}
        />
      </CollapseHeader>
      <CollapseBody style={styles.accordionBody}>
        {transactions.map((transaction) => (
          <TransactionItem
            key={transaction._id}
            id={transaction._id}
            type={transaction.type}
            category={transaction.category}
            description={transaction.description}
            date={transaction.date}
            value={transaction.value}
          />
        ))}
      </CollapseBody>
    </Collapse>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    justifyContent: "space-between",
    alignContent: "center",
    flexDirection: "row",
  },
  headerPrice: {
    alignContent: "center",
    flexDirection: "row",
  },
  accordionBody: {
    marginLeft: 20,
  },
});
