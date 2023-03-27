import {
    Collapse,
    CollapseBody,
    CollapseHeader,
} from "accordion-collapse-react-native"
import { useState } from "react"
import { StyleSheet } from "react-native"
import StyledText from "./StyledText"
import TransactionItem from "./TransactionItem"
import { NavArrowDown, NavArrowUp } from "iconoir-react-native"
import { theme } from "../theme"

export const TransactionsAccordion = ({ title, transactions }) => {
    const [expanded, setExpanded] = useState(true)
    const toggleCollapse = () => {
        setExpanded((expanded) => !expanded)
    }

    return (
        <Collapse isExpanded={expanded} onToggle={toggleCollapse}>
            <CollapseHeader style={styles.headerContainer}>
                {expanded ? (
                    <NavArrowUp
                        color={theme.colors.grey}
                        height={20}
                        width={20}
                    />
                ) : (
                    <NavArrowDown
                        color={theme.colors.grey}
                        height={20}
                        width={20}
                    />
                )}
                <StyledText fontWeight={"bold"}>{title}</StyledText>
            </CollapseHeader>
            <CollapseBody>
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
    )
}

const styles = StyleSheet.create({
    headerContainer: {
        alignContent: "center",
        flexDirection: "row",
    },
})
