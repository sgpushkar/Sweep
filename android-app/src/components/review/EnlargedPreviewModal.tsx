import React from 'react';
import {
  Modal,
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { MediaItem } from '../../types/media';
import { theme } from '../../theme/theme';
import { MediaDiscoveryService } from '../../services/mediaDiscovery';
import { Badge } from '../common/Badge';

interface EnlargedPreviewModalProps {
  item: MediaItem | null;
  visible: boolean;
  onClose: () => void;
}

export const EnlargedPreviewModal: React.FC<EnlargedPreviewModalProps> = ({
  item,
  visible,
  onClose,
}) => {
  if (!item) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Top Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {item.name}
          </Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            accessibilityLabel="Close inspection"
          >
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Media Preview Box */}
        <View style={styles.mediaBox}>
          <Image
            source={{ uri: item.uri }}
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        {/* Metadata Drawer */}
        <View style={styles.drawer}>
          <Text style={styles.drawerTitle}>File Details</Text>
          <ScrollView style={styles.drawerScroll} showsVerticalScrollIndicator={false}>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Type</Text>
              <Badge
                label={item.mediaType.toUpperCase()}
                variant={item.mediaType === 'video' ? 'info' : 'neutral'}
                size="sm"
              />
            </View>

            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>File Size</Text>
              <Text style={styles.metaValue}>
                {MediaDiscoveryService.formatBytes(item.size)} ({item.size.toLocaleString()} bytes)
              </Text>
            </View>

            {item.width && item.height ? (
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Dimensions</Text>
                <Text style={styles.metaValue}>{item.width} × {item.height} px</Text>
              </View>
            ) : null}

            {item.duration ? (
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Duration</Text>
                <Text style={styles.metaValue}>
                  {MediaDiscoveryService.formatDuration(item.duration)}
                </Text>
              </View>
            ) : null}

            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>MIME Type</Text>
              <Text style={styles.metaValue}>{item.mimeType}</Text>
            </View>

            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Date Added</Text>
              <Text style={styles.metaValue}>
                {MediaDiscoveryService.formatDate(item.dateAdded)}
              </Text>
            </View>

            {item.relativePath ? (
              <View style={styles.metaCol}>
                <Text style={styles.metaLabel}>Storage Location</Text>
                <Text style={styles.metaValueSub}>{item.relativePath}</Text>
              </View>
            ) : null}

            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>Content URI</Text>
              <Text style={styles.metaValueSub} numberOfLines={2}>
                {item.uri}
              </Text>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(5, 7, 9, 0.95)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderSubtle,
  },
  headerTitle: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
    flex: 1,
    marginRight: theme.spacing.md,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    fontSize: 16,
    color: theme.colors.textPrimary,
    fontWeight: '700',
  },
  mediaBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  drawer: {
    height: 240,
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.radii.xl,
    borderTopRightRadius: theme.radii.xl,
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderDefault,
  },
  drawerTitle: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  drawerScroll: {
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderSubtle,
  },
  metaCol: {
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderSubtle,
  },
  metaLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  metaValue: {
    ...theme.typography.caption,
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },
  metaValueSub: {
    ...theme.typography.mono,
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
});
