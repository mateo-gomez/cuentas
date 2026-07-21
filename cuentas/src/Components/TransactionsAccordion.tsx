import {
  Collapse,
  CollapseBody,
  CollapseHeader,
} from "accordion-collapse-react-native"
import { useState } from "react"
import { View } from "react-native"
import { StyledText } from "./StyledText"
import { TransactionItem } from "./TransactionItem"
import { useTheme, useThemedStyles } from "../theme/index"
import type { Theme } from "../theme/index"
import { NumberFormat } from "./NumberFormat"
import { Transaction, Balance } from "../../types"
import { Ionicons } from "@expo/vector-icons"

export interface TransactionsAccordionProps {
  title: string
  transactions: Transaction[]
  balance: Balance
}

export const TransactionsAccordion = ({
  title,
  transactions,
  balance,
}: TransactionsAccordionProps) => {
  const { theme } = useTheme()
  const styles = useThemedStyles(makeStyles)
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
              color={theme.palette.ink4}
              size={20}
            />
          ) : (
            <Ionicons
              name="chevron-down-outline"
              color={theme.palette.ink4}
              size={20}
            />
          )}
          <StyledText fontWeight={"bold"}>{title}</StyledText>
        </View>
        <NumberFormat
          value={balance.balance}
          color={balance.balance > 0 ? "green" : "red"}
        />
      </CollapseHeader>
      <CollapseBody style={styles.accordionBody}>
        {transactions.map((transaction) => (
          <TransactionItem
            key={transaction._id}
            id={transaction._id}
            type={transaction.type}
            categoryName={transaction.category?.name || "No category"}
            description={transaction.description}
            value={transaction.value}
            isTransfer={transaction.isTransfer}
          />
        ))}
      </CollapseBody>
    </Collapse>
  )
}

const makeStyles = (_theme: Theme) => ({
  headerContainer: {
    paddingVertical: 10,
    justifyContent: "space-between" as const,
    alignContent: "center" as const,
    flexDirection: "row" as const,
  },
  headerPrice: {
    alignContent: "center" as const,
    flexDirection: "row" as const,
  },
  accordionBody: {
    marginLeft: 20,
  },
})
