import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../../theme/theme';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightAction?: {
    label?: string;
    icon?: string;
    onPress: () => void;
  };
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onBack,
  rightAction,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.leftRow}>
        {onBack && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
            activeOpacity={0.7}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
        )}
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>

      {rightAction && (
        <TouchableOpacity
          style={styles.rightButton}
          onPress={rightAction.onPress}
          activeOpacity={0.7}
          accessibilityLabel={rightAction.label || 'Action'}
          accessibilityRole="button"
        >
          {rightAction.icon && <Text style={styles.actionIcon}>{rightAction.icon}</Text>}
          {rightAction.label && <Text style={styles.actionLabel}>{rightAction.label}</Text>}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderSubtle,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: theme.radii.sm,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  backArrow: {
    fontSize: 20,
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.textPrimary,
  },
  subtitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  rightButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  actionIcon: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    marginRight: 4,
  },
  actionLabel: {
    ...theme.typography.caption,
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },
});
