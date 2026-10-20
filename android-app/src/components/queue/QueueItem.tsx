import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { MediaItem } from '../../types/media';
import { theme } from '../../theme/theme';
import { MediaDiscoveryService } from '../../services/mediaDiscovery';
import { WhatsAppCleanerNativeBridge } from '../../native/WhatsAppCleanerNative';
import { Badge } from '../common/Badge';

interface QueueItemProps {
  item: MediaItem;
  isSelected: boolean;
  onToggleSelect: (item: MediaItem) => void;
  onPressPreview: (item: MediaItem) => void;
}

const VIDEO_EXTENSIONS = new Set([
  'mp4', '3gp', '3gpp', '3g2', 'mkv', 'mov', 'avi', 'webm',
  'm4v', 'wmv', 'flv', 'ts', 'm2ts', 'vob', 'ogv', 'divx'
]);

const AUDIO_EXTENSIONS = new Set([
  'opus', 'm4a', 'aac', 'mp3', 'ogg', 'amr', 'wav', 'flac', 'wma'
]);

export const QueueItem: React.FC<QueueItemProps> = ({
  item,
  isSelected,
  onToggleSelect,
  onPressPreview,
}) => {
  const [thumbUri, setThumbUri] = useState<string | null>(null);

  const lowerName = (item.name || '').toLowerCase();
  const lowerPath = (item.relativePath || '').toLowerCase();
  const lowerMime = (item.mimeType || '').toLowerCase();
  const ext = item.extension || lowerName.split('.').pop() || '';

  const isVideo =
    item.mediaType === 'video' ||
    lowerMime.startsWith('video/') ||
    VIDEO_EXTENSIONS.has(ext) ||
    lowerName.startsWith('vid-') ||
    lowerName.startsWith('video-') ||
    lowerPath.includes('video') ||
    lowerPath.includes('animated gifs');

  const isAudio =
    item.mediaType === 'audio' ||
    lowerMime.startsWith('audio/') ||
    AUDIO_EXTENSIONS.has(ext) ||
    lowerName.startsWith('ptt-') ||
    lowerName.startsWith('aud-') ||
    lowerPath.includes('audio') ||
    lowerPath.includes('voice notes');

  useEffect(() => {
    let isMounted = true;
    WhatsAppCleanerNativeBridge.getThumbnail(item.uri, isVideo)
      .then(thumb => {
        if (isMounted && thumb) {
          setThumbUri(thumb);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [item.uri, isVideo]);

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
        {thumbUri ? (
          <Image source={{ uri: thumbUri }} style={styles.thumbnail} resizeMode="cover" />
        ) : isVideo ? (
          <View style={[styles.thumbnail, styles.videoPlaceholder]}>
            <Text style={styles.videoPlaceholderIcon}>▶</Text>
          </View>
        ) : isAudio ? (
          <View style={[styles.thumbnail, styles.videoPlaceholder]}>
            <Text style={styles.videoPlaceholderIcon}>🎙️</Text>
          </View>
        ) : (
          <View style={[styles.thumbnail, styles.videoPlaceholder]}>
            <Text style={styles.videoPlaceholderIcon}>🖼️</Text>
          </View>
        )}
        {isVideo && (
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
        variant="neutral"
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
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  checkmark: {
    fontSize: 12,
    fontWeight: '800',
    color: '#09090B',
  },
  thumbnailContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.radii.sm,
    overflow: 'hidden',
    backgroundColor: '#121214',
    position: 'relative',
    marginRight: theme.spacing.md,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  videoPlaceholder: {
    backgroundColor: '#18181b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoPlaceholderIcon: {
    color: '#a1a1aa',
    fontSize: 14,
  },
  videoBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: 'rgba(0,0,0,0.7)',
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
