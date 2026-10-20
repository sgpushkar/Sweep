import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  Vibration,
} from 'react-native';
import { theme } from '../../theme/theme';

export type ButtonVariant = 'primary' | 'danger' | 'secondary' | 'ghost' | 'outline';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  haptic?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
  haptic = true,
}) => {
  const handlePress = () => {
    if (disabled || loading) return;
    if (haptic) {
      try {
        Vibration.vibrate(10);
      } catch {}
    }
    onPress();
  };

  const getContainerStyle = (): ViewStyle => {
    switch (variant) {
      case 'primary':
        return styles.primaryContainer;
      case 'danger':
        return styles.dangerContainer;
      case 'secondary':
        return styles.secondaryContainer;
      case 'outline':
        return styles.outlineContainer;
      case 'ghost':
        return styles.ghostContainer;
      default:
        return styles.primaryContainer;
    }
  };

  const getTextStyle = (): TextStyle => {
    switch (variant) {
      case 'primary':
        return styles.primaryText;
      case 'danger':
        return styles.dangerText;
      case 'secondary':
        return styles.secondaryText;
      case 'outline':
        return styles.outlineText;
      case 'ghost':
        return styles.ghostText;
      default:
        return styles.primaryText;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.baseContainer,
        getContainerStyle(),
        disabled && styles.disabledContainer,
        style,
      ]}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' || variant === 'danger' ? '#FFFFFF' : theme.colors.textPrimary}
        />
      ) : (
        <>
          {icon && <Text style={[getTextStyle(), styles.icon]}>{icon}</Text>}
          <Text style={[styles.baseText, getTextStyle(), disabled && styles.disabledText, textStyle]}>
            {label}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.radii.md,
    minHeight: 48,
  },
  baseText: {
    ...theme.typography.body,
    fontWeight: '600',
    textAlign: 'center',
  },
  icon: {
    marginRight: theme.spacing.sm,
  },
  primaryContainer: {
    backgroundColor: theme.colors.accent,
  },
  primaryText: {
    color: '#090B0E',
    fontWeight: '700',
  },
  dangerContainer: {
    backgroundColor: theme.colors.danger,
  },
  dangerText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  secondaryContainer: {
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.borderDefault,
  },
  secondaryText: {
    color: theme.colors.textPrimary,
  },
  outlineContainer: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.borderDefault,
  },
  outlineText: {
    color: theme.colors.textPrimary,
  },
  ghostContainer: {
    backgroundColor: 'transparent',
  },
  ghostText: {
    color: theme.colors.textSecondary,
  },
  disabledContainer: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.borderSubtle,
    opacity: 0.5,
  },
  disabledText: {
    color: theme.colors.textDisabled,
  },
});
