import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Vibration } from 'react-native';
import { theme } from '../../theme/theme';

interface ReviewControlsProps {
  onDelete: () => void;
  onKeep: () => void;
  onSkip: () => void;
  onUndo: () => void;
  canUndo: boolean;
  hapticEnabled?: boolean;
}

export const ReviewControls: React.FC<ReviewControlsProps> = ({
  onDelete,
  onKeep,
  onSkip,
  onUndo,
  canUndo,
  hapticEnabled = true,
}) => {
  const triggerHaptic = (ms: number = 15) => {
    if (hapticEnabled) {
      try {
        Vibration.vibrate(ms);
      } catch {}
    }
  };

  return (
    <View style={styles.container}>
      {/* Undo Button */}
      <TouchableOpacity
        style={[styles.smallButton, !canUndo && styles.disabledButton]}
        onPress={() => {
          if (!canUndo) return;
          triggerHaptic(10);
          onUndo();
        }}
        disabled={!canUndo}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Undo last action"
      >
        <Text style={[styles.controlIcon, !canUndo && styles.disabledText]}>↩</Text>
        <Text style={[styles.controlLabel, !canUndo && styles.disabledText]}>Undo</Text>
      </TouchableOpacity>

      {/* Delete Button (Primary Action Left) */}
      <TouchableOpacity
        style={[styles.actionButton, styles.deleteButton]}
        onPress={() => {
          triggerHaptic(25);
          onDelete();
        }}
        activeOpacity={0.75}
        accessibilityRole="button"
        accessibilityLabel="Mark for deletion"
      >
        <Text style={styles.deleteIcon}>✕</Text>
        <Text style={[styles.actionLabel, styles.deleteText]}>DELETE</Text>
      </TouchableOpacity>

      {/* Keep Button (Primary Action Right) */}
      <TouchableOpacity
        style={[styles.actionButton, styles.keepButton]}
        onPress={() => {
          triggerHaptic(20);
          onKeep();
        }}
        activeOpacity={0.75}
        accessibilityRole="button"
        accessibilityLabel="Keep item"
      >
        <Text style={styles.keepIcon}>✓</Text>
        <Text style={[styles.actionLabel, styles.keepText]}>KEEP</Text>
      </TouchableOpacity>

      {/* Skip Button */}
      <TouchableOpacity
        style={styles.smallButton}
        onPress={() => {
          triggerHaptic(10);
          onSkip();
        }}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Skip item"
      >
        <Text style={styles.controlIcon}>↷</Text>
        <Text style={styles.controlLabel}>Skip</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  actionButton: {
    flex: 1,
    height: 52,
    borderRadius: theme.radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginHorizontal: theme.spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  deleteButton: {
    backgroundColor: '#1c1c20',
    borderWidth: 1,
    borderColor: '#383840',
  },
  keepButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  deleteIcon: {
    fontSize: 18,
    fontWeight: '800',
    color: '#E4E4E7',
    marginRight: 6,
  },
  keepIcon: {
    fontSize: 18,
    fontWeight: '800',
    color: '#09090B',
    marginRight: 6,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  deleteText: {
    color: '#E4E4E7',
  },
  keepText: {
    color: '#09090B',
  },
  smallButton: {
    width: 52,
    height: 52,
    borderRadius: theme.radii.lg,
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlIcon: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    fontWeight: '700',
  },
  controlLabel: {
    fontSize: 10,
    color: theme.colors.textMuted,
    marginTop: 2,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.35,
  },
  disabledText: {
    color: theme.colors.textDisabled,
  },
});
