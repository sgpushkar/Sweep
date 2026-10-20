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
        return { bg: '#FFFFFF', text: '#09090B' };
      case 'danger':
        return { bg: '#27272A', text: '#E4E4E7' };
      case 'warning':
        return { bg: '#18181B', text: '#A1A1AA' };
      case 'info':
        return { bg: '#1F1F23', text: '#D4D4D8' };
      default:
        return { bg: '#18181B', text: '#A1A1AA' };
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
