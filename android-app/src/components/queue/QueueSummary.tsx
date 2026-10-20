import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../../theme/theme';
import { MediaDiscoveryService } from '../../services/mediaDiscovery';

interface QueueSummaryProps {
  totalCount: number;
  selectedCount: number;
  selectedBytes: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

export const QueueSummary: React.FC<QueueSummaryProps> = ({
  totalCount,
  selectedCount,
  selectedBytes,
  onSelectAll,
  onDeselectAll,
}) => {
  const allSelected = selectedCount === totalCount && totalCount > 0;

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View>
          <Text style={styles.label}>STORAGE TO RECLAIM</Text>
          <Text style={styles.sizeValue}>
            {MediaDiscoveryService.formatBytes(selectedBytes)}
          </Text>
        </View>

        <View style={styles.countBadge}>
          <Text style={styles.countText}>
            {selectedCount} of {totalCount} selected
          </Text>
        </View>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          onPress={allSelected ? onDeselectAll : onSelectAll}
          activeOpacity={0.7}
          style={styles.toggleButton}
        >
          <Text style={styles.toggleText}>
            {allSelected ? 'Deselect All' : 'Select All'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.safetyHint}>
          🔒 System authorization will prompt next
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderDefault,
    marginBottom: theme.spacing.lg,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  label: {
    ...theme.typography.label,
    color: theme.colors.dangerLight,
  },
  sizeValue: {
    ...theme.typography.h1,
    color: theme.colors.textPrimary,
    marginTop: 4,
  },
  countBadge: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    borderRadius: theme.radii.full,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  countText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderSubtle,
  },
  toggleButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  toggleText: {
    ...theme.typography.caption,
    color: theme.colors.accent,
    fontWeight: '700',
  },
  safetyHint: {
    ...theme.typography.caption,
    fontSize: 11,
    color: theme.colors.textMuted,
  },
});
