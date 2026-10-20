import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../theme/theme';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '📂',
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {actionLabel && onAction && (
        <Button
          label={actionLabel}
          onPress={onAction}
          variant="secondary"
          style={styles.button}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xxl,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
  },
  icon: {
    fontSize: 28,
  },
  title: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  description: {
    ...theme.typography.bodySecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: theme.spacing.xl,
    maxWidth: 280,
  },
  button: {
    minWidth: 160,
  },
});
