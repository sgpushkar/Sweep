import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../theme/theme';

export type BadgeVariant = 'accent' | 'danger' | 'warning' | 'neutral' | 'info';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'neutral', size = 'md' }) => {
  const getColors = () => {
    switch (variant) {
      case 'accent':
        return { bg: theme.colors.accentSubtle, text: theme.colors.accent };
      case 'danger':
        return { bg: theme.colors.dangerSubtle, text: theme.colors.danger };
      case 'warning':
        return { bg: theme.colors.warningSubtle, text: theme.colors.warning };
      case 'info':
        return { bg: theme.colors.infoSubtle, text: theme.colors.info };
      default:
        return { bg: theme.colors.surfaceElevated, text: theme.colors.textSecondary };
    }
  };

  const { bg, text } = getColors();

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: bg },
        size === 'sm' ? styles.smBadge : styles.mdBadge,
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: text },
          size === 'sm' ? styles.smText : styles.mdText,
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: theme.radii.full,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  smBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
  },
  mdBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 4,
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  smText: {
    fontSize: 10,
  },
  mdText: {
    fontSize: 12,
  },
});
