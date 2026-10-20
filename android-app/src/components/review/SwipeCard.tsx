import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  TouchableOpacity,
  Vibration,
  Platform,
} from 'react-native';
import { MediaItem } from '../../types/media';
import { theme } from '../../theme/theme';
import { MediaDiscoveryService } from '../../services/mediaDiscovery';
import { Badge } from '../common/Badge';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.28;

interface SwipeCardProps {
  item: MediaItem;
  onSwipeLeft: (item: MediaItem) => void; // DELETE
  onSwipeRight: (item: MediaItem) => void; // KEEP
  onTapPreview: (item: MediaItem) => void;
  hapticEnabled?: boolean;
}

export const SwipeCard: React.FC<SwipeCardProps> = ({
  item,
  onSwipeLeft,
  onSwipeRight,
  onTapPreview,
  hapticEnabled = true,
}) => {
  const pan = useRef(new Animated.ValueXY()).current;
  const [imageError, setImageError] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          // Swipe Right: KEEP
          triggerHaptic();
          Animated.timing(pan, {
            toValue: { x: SCREEN_WIDTH + 100, y: gesture.dy },
            duration: 250,
            useNativeDriver: false,
          }).start(() => onSwipeRight(item));
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          // Swipe Left: DELETE
          triggerHaptic();
          Animated.timing(pan, {
            toValue: { x: -SCREEN_WIDTH - 100, y: gesture.dy },
            duration: 250,
            useNativeDriver: false,
          }).start(() => onSwipeLeft(item));
        } else {
          // Spring back to center
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            friction: 6,
            tension: 40,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  const triggerHaptic = () => {
    if (hapticEnabled) {
      try {
        Vibration.vibrate(15);
      } catch {}
    }
  };

  // Card Rotation
  const rotate = pan.x.interpolate({
    inputRange: [-SCREEN_WIDTH * 1.5, 0, SCREEN_WIDTH * 1.5],
    outputRange: ['-14deg', '0deg', '14deg'],
  });

  // Keep badge opacity (swiping right)
  const keepOpacity = pan.x.interpolate({
    inputRange: [10, SWIPE_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  // Delete badge opacity (swiping left)
  const deleteOpacity = pan.x.interpolate({
    inputRange: [-SWIPE_THRESHOLD, -10],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View
      style={[
        styles.cardContainer,
        {
          transform: [
            { translateX: pan.x },
            { translateY: pan.y },
            { rotate },
          ],
        },
      ]}
      {...panResponder.panHandlers}
    >
      <TouchableOpacity
        style={styles.previewContainer}
        activeOpacity={0.95}
        onPress={() => onTapPreview(item)}
      >
        {/* Visual Badge Overlays during swipe */}
        <Animated.View style={[styles.badgeOverlay, styles.keepOverlay, { opacity: keepOpacity }]}>
          <Text style={styles.keepBadgeText}>KEEP</Text>
        </Animated.View>

        <Animated.View style={[styles.badgeOverlay, styles.deleteOverlay, { opacity: deleteOpacity }]}>
          <Text style={styles.deleteBadgeText}>DELETE</Text>
        </Animated.View>

        {/* Media Preview Image / Video Poster */}
        {imageError ? (
          <View style={styles.fallbackContainer}>
            <Text style={styles.fallbackIcon}>{item.mediaType === 'video' ? '🎬' : '🖼️'}</Text>
            <Text style={styles.fallbackText}>Preview Unavailable</Text>
            <Text style={styles.fallbackSubtext}>{item.name}</Text>
          </View>
        ) : (
          <Image
            source={{ uri: item.uri }}
            style={styles.image}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        )}

        {/* Video Play Indicator */}
        {item.mediaType === 'video' && (
          <View style={styles.videoIndicator}>
            <Text style={styles.playIcon}>▶</Text>
            {item.duration ? (
              <Text style={styles.durationText}>
                {MediaDiscoveryService.formatDuration(item.duration)}
              </Text>
            ) : null}
          </View>
        )}
      </TouchableOpacity>

      {/* Card Info Bar */}
      <View style={styles.metadataBar}>
        <View style={styles.metaLeft}>
          <Text style={styles.filename} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={styles.metaTagsRow}>
            <Badge
              label={item.mediaType.toUpperCase()}
              variant={item.mediaType === 'video' ? 'info' : 'neutral'}
              size="sm"
            />
            <Text style={styles.metaDot}>•</Text>
            <Text style={styles.fileSizeText}>
              {MediaDiscoveryService.formatBytes(item.size)}
            </Text>
            <Text style={styles.metaDot}>•</Text>
            <Text style={styles.dateText}>
              {MediaDiscoveryService.formatDate(item.dateAdded)}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.zoomButton}
          onPress={() => onTapPreview(item)}
          accessibilityLabel="Inspect media"
        >
          <Text style={styles.zoomIcon}>🔍</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.xl,
    borderWidth: 1,
    borderColor: theme.colors.borderDefault,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#050709',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  fallbackContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  fallbackIcon: {
    fontSize: 48,
    marginBottom: theme.spacing.sm,
  },
  fallbackText: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  fallbackSubtext: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  badgeOverlay: {
    position: 'absolute',
    top: 24,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radii.md,
    borderWidth: 2,
    zIndex: 10,
  },
  keepOverlay: {
    left: 24,
    backgroundColor: 'rgba(16, 185, 129, 0.25)',
    borderColor: theme.colors.accent,
    transform: [{ rotate: '-12deg' }],
  },
  keepBadgeText: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.accent,
    letterSpacing: 2,
  },
  deleteOverlay: {
    right: 24,
    backgroundColor: 'rgba(239, 68, 68, 0.25)',
    borderColor: theme.colors.danger,
    transform: [{ rotate: '12deg' }],
  },
  deleteBadgeText: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.danger,
    letterSpacing: 2,
  },
  videoIndicator: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 4,
    borderRadius: theme.radii.full,
  },
  playIcon: {
    fontSize: 12,
    color: '#FFF',
    marginRight: 6,
  },
  durationText: {
    ...theme.typography.caption,
    color: '#FFF',
    fontWeight: '600',
  },
  metadataBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surfaceElevated,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderSubtle,
  },
  metaLeft: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  filename: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  metaTagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  metaDot: {
    color: theme.colors.textMuted,
    marginHorizontal: 6,
    fontSize: 10,
  },
  fileSizeText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  dateText: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },
  zoomButton: {
    width: 36,
    height: 36,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  zoomIcon: {
    fontSize: 16,
  },
});
