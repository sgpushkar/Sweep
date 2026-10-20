import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { theme } from '../../theme/theme';

interface ProgressBarProps {
  progress: number; // 0 to 100
  color?: string;
  height?: number;
  showLabel?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color = theme.colors.accent,
  height = 6,
  showLabel = false,
}) => {
  const clamped = Math.min(100, Math.max(0, progress));

  return (
    <View style={styles.wrapper}>
      {showLabel && (
        <View style={styles.labelRow}>
          <Text style={styles.labelText}>Progress</Text>
          <Text style={styles.percentText}>{Math.round(clamped)}%</Text>
        </View>
      )}
      <View style={[styles.track, { height }]}>
        <View
          style={[
            styles.fill,
            {
              width: `${clamped}%`,
              backgroundColor: color,
              height,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },
  labelText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  percentText: {
    ...theme.typography.caption,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  track: {
    width: '100%',
    backgroundColor: theme.colors.surfaceHighlight,
    borderRadius: theme.radii.full,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: theme.radii.full,
  },
});
