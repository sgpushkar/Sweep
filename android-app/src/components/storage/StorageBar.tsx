import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { theme } from '../../theme/theme';
import { MediaDiscoveryService } from '../../services/mediaDiscovery';

interface StorageBarProps {
  totalBytes: number;
  imageBytes: number;
  videoBytes: number;
  pendingDeleteBytes: number;
}

export const StorageBar: React.FC<StorageBarProps> = ({
  totalBytes,
  imageBytes,
  videoBytes,
  pendingDeleteBytes,
}) => {
  const safeTotal = totalBytes > 0 ? totalBytes : 1;
  const imagePct = (imageBytes / safeTotal) * 100;
  const videoPct = (videoBytes / safeTotal) * 100;

  return (
    <View style={styles.container}>
      {/* Visual Segmented Bar */}
      <View style={styles.bar}>
        {imagePct > 0 && (
          <View style={[styles.segment, { width: `${imagePct}%`, backgroundColor: theme.colors.accent }]} />
        )}
        {videoPct > 0 && (
          <View style={[styles.segment, { width: `${videoPct}%`, backgroundColor: theme.colors.info }]} />
        )}
      </View>

      {/* Legend */}
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: theme.colors.accent }]} />
          <Text style={styles.legendLabel}>Images</Text>
          <Text style={styles.legendValue}>{MediaDiscoveryService.formatBytes(imageBytes)}</Text>
        </View>

        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: theme.colors.info }]} />
          <Text style={styles.legendLabel}>Videos</Text>
          <Text style={styles.legendValue}>{MediaDiscoveryService.formatBytes(videoBytes)}</Text>
        </View>

        {pendingDeleteBytes > 0 && (
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: theme.colors.danger }]} />
            <Text style={styles.legendLabel}>Pending Delete</Text>
            <Text style={[styles.legendValue, { color: theme.colors.dangerLight }]}>
              {MediaDiscoveryService.formatBytes(pendingDeleteBytes)}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    marginBottom: theme.spacing.lg,
  },
  bar: {
    height: 10,
    backgroundColor: theme.colors.surfaceHighlight,
    borderRadius: theme.radii.full,
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: theme.spacing.md,
  },
  segment: {
    height: '100%',
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingTop: theme.spacing.xs,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: theme.spacing.md,
    marginVertical: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: theme.radii.full,
    marginRight: 6,
  },
  legendLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginRight: 6,
  },
  legendValue: {
    ...theme.typography.caption,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
});
