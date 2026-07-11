import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import theme from '../theme';

type Tab = 'home' | 'budget';

interface Props {
  activeTab: Tab;
  onSelect: (tab: Tab) => void;
  onPressPlus: () => void;
}

export default function BottomTabBar({ activeTab, onSelect, onPressPlus }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom || 12 }]}>
      {/* Home tab */}
      <TouchableOpacity style={styles.tab} onPress={() => onSelect('home')}>
        <Ionicons name={activeTab === 'home' ? 'home' : 'home-outline'} size={22} color={activeTab === 'home' ? theme.ink : theme.ink3} />
        <Text style={[styles.label, { color: activeTab === 'home' ? theme.ink : theme.ink3 }]}>Inicio</Text>
      </TouchableOpacity>

      {/* Empty slot left of FAB */}
      <View style={styles.tab} />

      {/* FAB */}
      <View style={styles.fabSlot}>
        <TouchableOpacity style={styles.fab} onPress={onPressPlus}>
          <Ionicons name="add" size={30} color={theme.onAccent} />
        </TouchableOpacity>
      </View>

      {/* Empty slot right of FAB */}
      <View style={styles.tab} />

      {/* Budget tab */}
      <TouchableOpacity style={styles.tab} onPress={() => onSelect('budget')}>
        <Ionicons name={activeTab === 'budget' ? 'pie-chart' : 'pie-chart-outline'} size={22} color={activeTab === 'budget' ? theme.ink : theme.ink3} />
        <Text style={[styles.label, { color: activeTab === 'budget' ? theme.ink : theme.ink3 }]}>Budget</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: theme.surface,
    borderTopWidth: 1,
    borderTopColor: theme.line,
    paddingTop: 10,
    alignItems: 'flex-end',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: 4,
    gap: 3,
  },
  label: {
    fontSize: 10,
    fontFamily: theme.fonts?.sans,
  },
  fabSlot: {
    width: 88,
    alignItems: 'center',
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 8,
    transform: [{ translateY: -18 }],
  },
});
