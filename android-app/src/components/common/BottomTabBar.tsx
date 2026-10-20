import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Vibration } from 'react-native';
import { theme } from '../../theme/theme';
import { MainTab, useAppNavigation } from '../../navigation/NavigationContext';

interface TabItem {
  id: MainTab;
  label: string;
  icon: string;
  badge?: number;
}

interface BottomTabBarProps {
  queueCount?: number;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({ queueCount = 0 }) => {
  const { activeTab, navigateTab } = useAppNavigation();

  const tabs: TabItem[] = [
    { id: 'home', label: 'Home', icon: '✦' },
    { id: 'clean', label: 'Clean', icon: '◈' },
    { id: 'storage', label: 'Storage', icon: '◫' },
    { id: 'settings', label: 'Settings', icon: '⚙' },
  ];

  return (
    <View style={styles.container}>
      {tabs.map(tab => {
        const isActive = activeTab === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.tabButton}
            onPress={() => {
              try {
                Vibration.vibrate(8);
              } catch {}
              navigateTab(tab.id);
            }}
            activeOpacity={0.7}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
          >
            <View style={styles.iconBox}>
              <Text style={[styles.icon, isActive && styles.activeIcon]}>
                {tab.icon}
              </Text>
              {tab.id === 'clean' && queueCount > 0 && (
                <View style={styles.badgeDot} />
              )}
            </View>
            <Text style={[styles.label, isActive && styles.activeLabel]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#0c0c0f',
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderSubtle,
    paddingVertical: 10,
    paddingHorizontal: theme.spacing.md,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBox: {
    position: 'relative',
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 16,
    color: theme.colors.textMuted,
  },
  activeIcon: {
    color: theme.colors.accent,
  },
  badgeDot: {
    position: 'absolute',
    top: -2,
    right: -8,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.danger,
  },
  label: {
    ...theme.typography.caption,
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 4,
    fontWeight: '500',
  },
  activeLabel: {
    color: theme.colors.accent,
    fontWeight: '600',
  },
});
