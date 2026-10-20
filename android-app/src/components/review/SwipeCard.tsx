import React, { useRef, useState, useEffect } from 'react';
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
import { WhatsAppCleanerNativeBridge } from '../../native/WhatsAppCleanerNative';
import { Badge } from '../common/Badge';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.28;
const DECK_IMAGE_WIDTH = Math.round(SCREEN_WIDTH - 48);
const DECK_IMAGE_HEIGHT = Math.round(SCREEN_HEIGHT * 0.58);

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
  const isSwiping = useRef(false);
  const [imageError, setImageError] = useState(false);
  const [thumbUri, setThumbUri] = useState<string | null>(null);

  const lowerName = (item.name || '').toLowerCase();
  const lowerMime = (item.mimeType || '').toLowerCase();
  const isVideo =
    item.mediaType === 'video' ||
    lowerMime.startsWith('video/') ||
    lowerName.endsWith('.mp4') ||
    lowerName.endsWith('.3gp') ||
    lowerName.endsWith('.mkv') ||
    lowerName.endsWith('.mov') ||
    lowerName.endsWith('.avi');

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

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !isSwiping.current,
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, gesture) => {
        if (isSwiping.current) return;

        if (gesture.dx > SWIPE_THRESHOLD) {
          // Swipe Right: KEEP
          isSwiping.current = true;
          triggerHaptic();
          Animated.timing(pan, {
            toValue: { x: SCREEN_WIDTH + 100, y: gesture.dy },
            duration: 220,
            useNativeDriver: false,
          }).start(() => {
            onSwipeRight(item);
          });
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          // Swipe Left: DELETE
          isSwiping.current = true;
          triggerHaptic();
          Animated.timing(pan, {
            toValue: { x: -SCREEN_WIDTH - 100, y: gesture.dy },
            duration: 220,
            useNativeDriver: false,
          }).start(() => {
            onSwipeLeft(item);
          });
        } else {
          // Spring back to center
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            friction: 6,
            tension: 40,
            useNativeDriver: false,
          }).start(() => {
            isSwiping.current = false;
          });
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

        {/* Media Preview: Handle Videos Safely Without Crashing Image Decoder */}
        {isVideo ? (
          <View style={styles.fallbackContainer}>
            {thumbUri ? (
              <Image
                source={{ uri: thumbUri }}
                style={[styles.image, { width: DECK_IMAGE_WIDTH, height: DECK_IMAGE_HEIGHT, position: 'absolute' }]}
                resizeMode="cover"
              />
            ) : null}
            <View style={styles.videoPosterCircle}>
              <Text style={styles.playIconLarge}>▶</Text>
            </View>
            <Text style={styles.fallbackText}>WhatsApp Video</Text>
            <Text style={styles.fallbackSubtext}>{item.name}</Text>
            {item.duration ? (
              <Text style={styles.videoDurationLabel}>
                {MediaDiscoveryService.formatDuration(item.duration)} • {MediaDiscoveryService.formatBytes(item.size)}
              </Text>
            ) : null}
          </View>
        ) : imageError ? (
          <View style={styles.fallbackContainer}>
            <Text style={styles.fallbackIcon}>🖼️</Text>
            <Text style={styles.fallbackText}>Preview Unavailable</Text>
            <Text style={styles.fallbackSubtext}>{item.name}</Text>
          </View>
        ) : (
          <Image
            source={{ uri: thumbUri || item.uri }}
            style={[styles.image, { width: DECK_IMAGE_WIDTH, height: DECK_IMAGE_HEIGHT }]}
            resizeMode="cover"
            resizeMethod="resize"
            onError={() => setImageError(true)}
          />
        )}

        {/* Video Play Indicator */}
        {isVideo && (
          <View style={styles.videoIndicator}>
            <Text style={styles.playIcon}>🎬</Text>
            <Text style={styles.durationText}>Video</Text>
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
    backgroundColor: theme.colors.background,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: DECK_IMAGE_WIDTH,
    height: DECK_IMAGE_HEIGHT,
  },
  fallbackContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  videoPosterCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  playIconLarge: {
    fontSize: 26,
    color: '#FFF',
    marginLeft: 4,
  },
  videoDurationLabel: {
    ...theme.typography.caption,
    color: theme.colors.accent,
    fontWeight: '700',
    marginTop: 8,
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
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: '#FFFFFF',
    transform: [{ rotate: '-12deg' }],
  },
  keepBadgeText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  deleteOverlay: {
    right: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    borderColor: '#71717A',
    transform: [{ rotate: '12deg' }],
  },
  deleteBadgeText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#D4D4D8',
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
