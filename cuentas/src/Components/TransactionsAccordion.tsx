import {
  Collapse,
  CollapseBody,
  CollapseHeader,
} from "accordion-collapse-react-native"
import { useState } from "react"
import { StyleSheet, View } from "react-native"
import { StyledText } from "./StyledText"
import { TransactionItem } from "./TransactionItem"
import { theme } from "../theme"
import { NumberFormat } from "./NumberFormat"
import { Transaction, Balance } from "../../types"
import { Ionicons } from "@expo/vector-icons"

export interface TransactionsAccordionProps {
  title: string
  transactions: Transaction[]
  totals: Balance
}

export const TransactionsAccordion = ({
  title,
  transactions,
  totals,
}: TransactionsAccordionProps) => {
  const [expanded, setExpanded] = useState(true)
  const toggleCollapse = () => {
    setExpanded((expanded) => !expanded)
  }

  return (
    <Collapse isExpanded={expanded} onToggle={toggleCollapse}>
      <CollapseHeader style={styles.headerContainer}>
        <View style={styles.headerPrice}>
          {expanded ? (
            <Ionicons
              name="chevron-up-outline"
              color={theme.colors.grey}
              size={20}
            />
          ) : (
            <Ionicons
              name="chevron-down-outline"
              color={theme.colors.grey}
              size={20}
            />
          )}
          <StyledText fontWeight={"bold"}>{title}</StyledText>
        </View>
        <NumberFormat
          value={totals.balance}
          color={totals.balance > 0 ? "green" : "red"}
        />
      </CollapseHeader>
      <CollapseBody style={styles.accordionBody}>
        {transactions.map((transaction) => (
          <TransactionItem
            key={transaction._id}
            id={transaction._id}
            type={transaction.type}
            categoryName={transaction.category.name}
            description={transaction.description}
            value={transaction.value}
          />
        ))}
      </CollapseBody>
    </Collapse>
  )
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingVertical: 10,
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
})
