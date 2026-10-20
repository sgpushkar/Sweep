import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { theme } from '../../theme/theme';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  elevated?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, style, elevated = false }) => {
  return (
    <View
      style={[
        styles.card,
        elevated ? styles.elevated : styles.surface,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    padding: theme.spacing.lg,
  },
  surface: {
    backgroundColor: theme.colors.surface,
  },
  elevated: {
    backgroundColor: theme.colors.surfaceElevated,
    borderColor: theme.colors.borderDefault,
  },
});
