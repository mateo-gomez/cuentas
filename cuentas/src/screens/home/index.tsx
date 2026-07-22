import {
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { useNavigate } from "react-router"
import { useTheme, useThemedStyles } from "../../theme/index"
import type { Theme } from "../../theme/index"
import { useRef, useState } from "react"
import { Ionicons } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import BottomTabBar from "../../Components/BottomTabBar"
import { AccountPickerModal } from "../../Components/AccountPickerModal"
import SuggestionChip from "../../Components/SuggestionChip"
import Transactions from "./Transactions"
import { useDateRange } from "../../hooks/useDateRange"
import { useAccounts, useSuggestions, useTabBar } from "../../hooks"
import { monthRange } from "../../utils"
import { createLogger } from "../../lib/logger"
import { FrequentCombo, TransactionType } from "../../../types"

const logger = createLogger("Home")

const isWeb = Platform.OS === "web"

const now = new Date()

const MONTH_NAMES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
]

const initialSteps = [
  {
    id: "3",
    ...monthRange(now.getFullYear(), now.getMonth()),
  },
  {
    id: "2",
    ...monthRange(now.getFullYear(), now.getMonth() - 1),
  },
  {
    id: "1",
    ...monthRange(now.getFullYear(), now.getMonth() - 2),
  },
]

const Home = () => {
  const { theme } = useTheme()
  const styles = useThemedStyles(makeStyles)
  const { dateRange: totalDateRange } = useDateRange()
  const { accounts } = useAccounts()
  const [steps, setSteps] = useState(initialSteps)
  const [visibleIndex, setVisibleIndex] = useState(0)
  // Size of a single paged month. Measured from the list container so the page
  // matches the desktop content area, not the full browser width. The height is
  // needed to bound the inner transaction scroller — on react-native-web a
  // horizontal VirtualizedList item doesn't reliably resolve a flex height, so
  // without an explicit height the inner ScrollView never scrolls.
  const [pageWidth, setPageWidth] = useState(0)
  const [pageHeight, setPageHeight] = useState(0)
  const [selectedAccountId, setSelectedAccountId] = useState("")
  const [accountPickerVisible, setAccountPickerVisible] = useState(false)
  const { suggestions } = useSuggestions(selectedAccountId || undefined)
  const navigate = useNavigate()
  const insets = useSafeAreaInsets()
  const tabBar = useTabBar()
  const listRef = useRef<FlatList | null>(null)

  // FlatList freezes these after first render; keep stable refs so web
  // (react-native-web) doesn't throw "Changing onViewableItemsChanged on the fly".
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 51 }).current
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: Array<{ index: number | null }> }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setVisibleIndex(viewableItems[0].index)
      }
    },
  ).current

  const selectedAccountName =
    accounts.find((account) => account._id === selectedAccountId)?.name ??
    "Todo"

  const visibleStep = steps[visibleIndex] ?? steps[0]
  const visibleMonth = visibleStep?.start
    ? MONTH_NAMES[visibleStep.start.getMonth()] +
      " " +
      visibleStep.start.getFullYear()
    : ""

  // Returns true when a page was appended (older data still available).
  const onEndReached = () => {
    logger.debug("FlatList end reached")
    const currentStep = steps.at(-1)

    if (totalDateRange?.start && totalDateRange.start < currentStep.start) {
      const { start, end } = monthRange(
        currentStep.start.getFullYear(),
        currentStep.start.getMonth() - 1,
      )

      const newPage = {
        id: Date.now().toString(),
        start,
        end,
      }

      setSteps((prevStates) => [...prevStates, newPage])
      return true
    }

    return false
  }

  // Returns true when a page was prepended (newer data still available).
  const onStartReached = () => {
    const currentStep = steps.at(0)

    if (totalDateRange?.end && totalDateRange.end > currentStep.end) {
      const { start, end } = monthRange(
        currentStep.start.getFullYear(),
        currentStep.start.getMonth() + 1,
      )

      const newPage = {
        id: Date.now().toString(),
        start,
        end,
      }

      setSteps((prevStates) => [newPage, ...prevStates])
      return true
    }

    return false
  }

  const handlePressFab = () => {
    navigate("/transactions/outcome", {
      state: { accountId: selectedAccountId || undefined },
    })
  }

  const handleSelectSuggestion = (combo: FrequentCombo) => {
    const routeType =
      combo.type === TransactionType.income ? "income" : "outcome"

    navigate(`/transactions/${routeType}`, {
      state: {
        accountId: selectedAccountId || combo.accountId,
        category: combo.category,
        description: combo.description,
      },
    })
  }

  const scrollToMonth = (index: number) => {
    // Defer so a freshly appended page is committed before we scroll to it.
    requestAnimationFrame(() => {
      listRef.current?.scrollToIndex({ index, animated: true })
    })
  }

  const goToPrevMonth = () => {
    const nextIndex = visibleIndex + 1
    // At the oldest loaded page: only advance if there's older data to append.
    if (nextIndex >= steps.length && !onEndReached()) return
    setVisibleIndex(nextIndex)
    scrollToMonth(nextIndex)
  }

  const goToNextMonth = () => {
    if (visibleIndex <= 0) return
    const nextIndex = visibleIndex - 1
    setVisibleIndex(nextIndex)
    scrollToMonth(nextIndex)
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Inline header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>cuentas</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.importPill}
            onPress={() => navigate("/import")}
            accessibilityRole="button"
            accessibilityLabel="Importar transacciones"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name="cloud-upload-outline"
              size={16}
              color={theme.palette.ink3}
            />
            <Text style={styles.importPillText}>Importar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.importPill}
            onPress={() => navigate("/reports")}
            accessibilityRole="button"
            accessibilityLabel="Ver informes por categoría"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name="pie-chart-outline"
              size={16}
              color={theme.palette.ink3}
            />
            <Text style={styles.importPillText}>Informes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.searchPill} onPress={() => {}}>
            <Text style={styles.searchPillText}>Buscar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Month switcher */}
      <View style={styles.monthSwitcher}>
        <TouchableOpacity
          onPress={goToPrevMonth}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="chevron-back" size={22} color={theme.palette.ink3} />
        </TouchableOpacity>
        <Text style={styles.monthLabel}>{visibleMonth}</Text>
        <TouchableOpacity
          onPress={goToNextMonth}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons
            name="chevron-forward"
            size={22}
            color={theme.palette.ink3}
          />
        </TouchableOpacity>
      </View>

      {/* Account filter */}
      <View style={styles.accountFilterRow}>
        <TouchableOpacity
          style={styles.accountPill}
          onPress={() => setAccountPickerVisible(true)}
        >
          <Ionicons
            name="wallet-outline"
            size={14}
            color={theme.palette.ink3}
          />
          <Text style={styles.accountPillText} numberOfLines={1}>
            {selectedAccountName}
          </Text>
          <Ionicons name="chevron-down" size={14} color={theme.palette.ink3} />
        </TouchableOpacity>
      </View>

      {/* Suggestion chips (frequent combos for the active account) */}
      {suggestions.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.suggestions}
          contentContainerStyle={styles.suggestionsRow}
        >
          {suggestions.map((combo) => (
            <SuggestionChip
              key={`${combo.description}-${combo.category._id}-${combo.type}`}
              combo={combo}
              onPress={handleSelectSuggestion}
            />
          ))}
        </ScrollView>
      ) : null}

      {/* Transaction list. Web navigates months with the ‹ › arrows, so it
          renders just the visible month as a plain top-level scroller — no
          horizontal pager to swallow the mouse wheel. Native keeps the swipeable
          paged FlatList. */}
      <View
        style={styles.listContainer}
        onLayout={(e) => {
          setPageWidth(e.nativeEvent.layout.width)
          setPageHeight(e.nativeEvent.layout.height)
        }}
      >
        {isWeb ? (
          <Transactions
            key={visibleStep?.id}
            start={visibleStep.start}
            end={visibleStep.end}
            accountId={selectedAccountId || undefined}
          />
        ) : pageWidth > 0 && pageHeight > 0 ? (
          <FlatList
            key={pageWidth}
            ref={listRef}
            data={steps}
            renderItem={({ item }) => (
              <Transactions
                start={item.start}
                end={item.end}
                accountId={selectedAccountId || undefined}
                width={pageWidth}
                height={pageHeight}
              />
            )}
            onScrollToIndexFailed={({ index }) => {
              setTimeout(() => {
                listRef.current?.scrollToIndex({ index, animated: true })
              }, 80)
            }}
            pagingEnabled
            horizontal
            inverted
            initialNumToRender={5}
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            onStartReached={onStartReached}
            onEndReached={onEndReached}
            onEndReachedThreshold={1}
            onStartReachedThreshold={1}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            getItemLayout={(_, index) => ({
              length: pageWidth,
              offset: pageWidth * index,
              index,
            })}
          />
        ) : null}
      </View>

      {/* Bottom tab bar */}
      <BottomTabBar {...tabBar} onPressPlus={handlePressFab} />

      <AccountPickerModal
        visible={accountPickerVisible}
        accounts={accounts}
        selectedId={selectedAccountId || undefined}
        allowAll
        onSelect={setSelectedAccountId}
        onClose={() => setAccountPickerVisible(false)}
      />
    </View>
  )
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: theme.palette.bg,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 4,
    },
    headerTitle: {
      fontFamily: theme.weight.semibold,
      fontSize: 22,
      color: theme.palette.ink,
    },
    headerActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    searchPill: {
      backgroundColor: theme.palette.surface3,
      borderRadius: 20,
      paddingHorizontal: 14,
      paddingVertical: 6,
    },
    searchPillText: {
      fontSize: 14,
      color: theme.palette.ink3,
    },
    importPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: theme.palette.surface3,
      borderRadius: 20,
      paddingHorizontal: 14,
      paddingVertical: 6,
    },
    importPillText: {
      fontSize: 14,
      color: theme.palette.ink3,
    },
    monthSwitcher: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 8,
      gap: 16,
    },
    monthLabel: {
      fontFamily: theme.weight.bold,
      fontSize: 34,
      color: theme.palette.ink,
    },
    listContainer: {
      flex: 1,
    },
    accountFilterRow: {
      flexDirection: "row",
      justifyContent: "center",
      paddingBottom: 8,
    },
    accountPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: theme.palette.surface3,
      borderRadius: 20,
      paddingHorizontal: 14,
      paddingVertical: 6,
      maxWidth: 220,
    },
    accountPillText: {
      fontFamily: theme.fonts.sans,
      fontSize: 13,
      color: theme.palette.ink3,
    },
    suggestions: {
      flexGrow: 0,
    },
    suggestionsRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 20,
      paddingBottom: 8,
    },
  })

export default Home
