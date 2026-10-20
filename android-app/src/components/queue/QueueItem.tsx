import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { MediaItem } from '../../types/media';
import { theme } from '../../theme/theme';
import { MediaDiscoveryService } from '../../services/mediaDiscovery';
import { Badge } from '../common/Badge';

interface QueueItemProps {
  item: MediaItem;
  isSelected: boolean;
  onToggleSelect: (item: MediaItem) => void;
  onPressPreview: (item: MediaItem) => void;
}

export const QueueItem: React.FC<QueueItemProps> = ({
  item,
  isSelected,
  onToggleSelect,
  onPressPreview,
}) => {
  return (
    <View style={[styles.container, !isSelected && styles.deselectedContainer]}>
      {/* Checkbox Toggle */}
      <TouchableOpacity
        style={styles.checkboxTouch}
        onPress={() => onToggleSelect(item)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: isSelected }}
      >
        <View style={[styles.checkbox, isSelected && styles.checkboxActive]}>
          {isSelected && <Text style={styles.checkmark}>✓</Text>}
        </View>
      </TouchableOpacity>

      {/* Media Thumbnail */}
      <TouchableOpacity
        style={styles.thumbnailContainer}
        onPress={() => onPressPreview(item)}
        activeOpacity={0.8}
      >
        <Image source={{ uri: item.uri }} style={styles.thumbnail} />
        {item.mediaType === 'video' && (
          <View style={styles.videoBadge}>
            <Text style={styles.videoIcon}>▶</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Item Details */}
      <View style={styles.detailsContainer}>
        <Text style={styles.nameText} numberOfLines={1}>
          {item.name}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.sizeText}>
            {MediaDiscoveryService.formatBytes(item.size)}
          </Text>
          <Text style={styles.metaDot}>•</Text>
          <Text style={styles.dateText}>
            {MediaDiscoveryService.formatDate(item.dateAdded)}
          </Text>
        </View>
      </View>

      {/* Type Badge */}
      <Badge
        label={item.mediaType.toUpperCase()}
        variant={item.mediaType === 'video' ? 'info' : 'neutral'}
        size="sm"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    marginBottom: theme.spacing.sm,
  },
  deselectedContainer: {
    opacity: 0.5,
    backgroundColor: theme.colors.backgroundElevated,
  },
  checkboxTouch: {
    paddingRight: theme.spacing.md,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: theme.radii.xs,
    borderWidth: 2,
    borderColor: theme.colors.borderDefault,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: theme.colors.danger,
    borderColor: theme.colors.danger,
  },
  checkmark: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFF',
  },
  thumbnailContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.radii.sm,
    overflow: 'hidden',
    backgroundColor: '#000',
    position: 'relative',
    marginRight: theme.spacing.md,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  videoBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 4,
    paddingHorizontal: 3,
  },
  videoIcon: {
    fontSize: 8,
    color: '#FFF',
  },
  detailsContainer: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  nameText: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  sizeText: {
    ...theme.typography.caption,
    color: theme.colors.dangerLight,
    fontWeight: '600',
  },
  metaDot: {
    color: theme.colors.textMuted,
    marginHorizontal: 6,
    fontSize: 10,
  },
  dateText: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },
});
