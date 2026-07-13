import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import theme from '../theme';

export type Tab = 'home' | 'accounts' | 'budget' | 'profile';

interface Props {
  activeTab: Tab;
  onSelect: (tab: Tab) => void;
  onPressPlus: () => void;
}

interface NavTabProps {
  tab: Tab;
  activeTab: Tab;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
  label: string;
  onSelect: (tab: Tab) => void;
}

// Extracted to avoid duplicating the icon+label+active-color markup 4x.
function NavTab({ tab, activeTab, icon, activeIcon, label, onSelect }: NavTabProps) {
  const isActive = activeTab === tab;
  const color = isActive ? theme.ink : theme.ink3;

  return (
    <TouchableOpacity style={styles.tab} onPress={() => onSelect(tab)}>
      <Ionicons name={isActive ? activeIcon : icon} size={22} color={color} />
      <Text numberOfLines={1} style={[styles.label, { color }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function BottomTabBar({ activeTab, onSelect, onPressPlus }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom || 12 }]}>
      <NavTab
        tab="home"
        activeTab={activeTab}
        icon="home-outline"
        activeIcon="home"
        label="Inicio"
        onSelect={onSelect}
      />

      <NavTab
        tab="accounts"
        activeTab={activeTab}
        icon="wallet-outline"
        activeIcon="wallet"
        label="Cuentas"
        onSelect={onSelect}
      />

      {/* FAB */}
      <View style={styles.fabSlot}>
        <TouchableOpacity style={styles.fab} onPress={onPressPlus}>
          <Ionicons name="add" size={30} color={theme.onAccent} />
        </TouchableOpacity>
      </View>

      <NavTab
        tab="budget"
        activeTab={activeTab}
        icon="pie-chart-outline"
        activeIcon="pie-chart"
        label="Budget"
        onSelect={onSelect}
      />

      <NavTab
        tab="profile"
        activeTab={activeTab}
        icon="person-outline"
        activeIcon="person"
        label="Perfil"
        onSelect={onSelect}
      />
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
