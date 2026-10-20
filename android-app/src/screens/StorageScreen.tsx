import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { theme } from '../theme/theme';
import { Header } from '../components/common/Header';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { StorageBar } from '../components/storage/StorageBar';
import { EnlargedPreviewModal } from '../components/review/EnlargedPreviewModal';
import { MediaItem, ReviewDecision, ReviewDecisionMap, ScanSummary } from '../types/media';
import { MediaDiscoveryService } from '../services/mediaDiscovery';
import { DuplicateGroup, DuplicateService } from '../services/duplicateService';
import { useAppNavigation } from '../navigation/NavigationContext';

interface StorageScreenProps {
  scanSummary: ScanSummary | null;
  decisions: ReviewDecisionMap;
  onDecision: (item: MediaItem, decision: ReviewDecision) => void;
}

export const StorageScreen: React.FC<StorageScreenProps> = ({
  scanSummary,
  decisions,
  onDecision,
}) => {
  const { navigateTo } = useAppNavigation();
  const [activeTab, setActiveTab] = useState<'overview' | 'largest' | 'duplicates'>('overview');
  const [inspectItem, setInspectItem] = useState<MediaItem | null>(null);

  const items = scanSummary?.items || [];
  const imageItems = items.filter(i => i.mediaType === 'image');
  const videoItems = items.filter(i => i.mediaType === 'video');

  const imageBytes = imageItems.reduce((acc, c) => acc + (c.size || 0), 0);
  const videoBytes = videoItems.reduce((acc, c) => acc + (c.size || 0), 0);

  const pendingDeleteItems = items.filter(i => decisions[i.id]?.decision === 'DELETE');
  const pendingDeleteBytes = pendingDeleteItems.reduce((acc, c) => acc + (c.size || 0), 0);

  const largestItems = [...items].sort((a, b) => (b.size || 0) - (a.size || 0)).slice(0, 15);
  const duplicates = DuplicateService.findExactDuplicates(items);

  const totalDuplicateReclaimable = duplicates.reduce(
    (acc, d) => acc + d.potentialReclaimableBytes,
    0
  );

  return (
    <View style={styles.container}>
      <Header title="Storage Insights" subtitle="WhatsApp Media Analysis" />

      {/* Segmented Sub-Navigation Tabs */}
      <View style={styles.subTabsRow}>
        <TouchableOpacity
          style={[styles.subTab, activeTab === 'overview' && styles.activeSubTab]}
          onPress={() => setActiveTab('overview')}
        >
          <Text style={[styles.subTabText, activeTab === 'overview' && styles.activeSubTabText]}>
            Overview
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.subTab, activeTab === 'largest' && styles.activeSubTab]}
          onPress={() => setActiveTab('largest')}
        >
          <Text style={[styles.subTabText, activeTab === 'largest' && styles.activeSubTabText]}>
            Largest Files
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.subTab, activeTab === 'duplicates' && styles.activeSubTab]}
          onPress={() => setActiveTab('duplicates')}
        >
          <Text style={[styles.subTabText, activeTab === 'duplicates' && styles.activeSubTabText]}>
            Duplicates ({duplicates.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {activeTab === 'overview' && (
          <>
            {/* Visual Storage Breakdown Bar */}
            <StorageBar
              totalBytes={scanSummary?.totalSizeBytes || 0}
              imageBytes={imageBytes}
              videoBytes={videoBytes}
              pendingDeleteBytes={pendingDeleteBytes}
            />

            {/* Total Metric Card */}
            <Card style={styles.metricCard}>
              <Text style={styles.metricLabel}>TOTAL ACCESSIBLE WHATSAPP MEDIA</Text>
              <Text style={styles.metricValue}>
                {MediaDiscoveryService.formatBytes(scanSummary?.totalSizeBytes || 0)}
              </Text>
              <Text style={styles.metricSub}>
                {items.length.toLocaleString()} files discovered across WhatsApp folders
              </Text>
            </Card>

            {/* Grid Breakdown */}
            <View style={styles.gridRow}>
              <Card style={styles.halfCard}>
                <Badge label="IMAGES" variant="accent" size="sm" />
                <Text style={styles.cardBigNumber}>{imageItems.length}</Text>
                <Text style={styles.cardSizeLabel}>
                  {MediaDiscoveryService.formatBytes(imageBytes)}
                </Text>
              </Card>

              <Card style={styles.halfCard}>
                <Badge label="VIDEOS" variant="info" size="sm" />
                <Text style={styles.cardBigNumber}>{videoItems.length}</Text>
                <Text style={styles.cardSizeLabel}>
                  {MediaDiscoveryService.formatBytes(videoBytes)}
                </Text>
              </Card>
            </View>

            {/* Pending Deletions Summary */}
            <TouchableOpacity
              onPress={() => navigateTo('queue')}
              activeOpacity={0.8}
            >
              <Card style={styles.queueCard}>
                <View style={styles.queueCardRow}>
                  <View>
                    <Text style={styles.queueLabel}>MARKED FOR DELETION</Text>
                    <Text style={styles.queueValue}>
                      {MediaDiscoveryService.formatBytes(pendingDeleteBytes)}
                    </Text>
                    <Text style={styles.queueSub}>
                      {pendingDeleteItems.length} candidate files ready for system deletion
                    </Text>
                  </View>
                  <Text style={styles.arrowIcon}>→</Text>
                </View>
              </Card>
            </TouchableOpacity>
          </>
        )}

        {activeTab === 'largest' && (
          <View>
            <Text style={styles.sectionHeading}>Largest Media Items</Text>
            <Text style={styles.sectionSubtitle}>
              Top space consumers ordered by descending file size.
            </Text>

            {largestItems.map(item => {
              const currentDecision = decisions[item.id]?.decision || 'PENDING';
              return (
                <View key={item.id} style={styles.fileRow}>
                  <TouchableOpacity
                    style={styles.fileLeft}
                    onPress={() => setInspectItem(item)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.fileName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <View style={styles.fileMeta}>
                      <Badge
                        label={item.mediaType.toUpperCase()}
                        variant={item.mediaType === 'video' ? 'info' : 'neutral'}
                        size="sm"
                      />
                      <Text style={styles.fileMetaText}>
                        {MediaDiscoveryService.formatBytes(item.size)}
                      </Text>
                      <Text style={styles.fileMetaText}>
                        {MediaDiscoveryService.formatDate(item.dateAdded)}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <View style={styles.decisionBadgeBox}>
                    {currentDecision === 'DELETE' ? (
                      <Badge label="MARKED DELETE" variant="danger" size="sm" />
                    ) : currentDecision === 'KEEP' ? (
                      <Badge label="KEPT" variant="accent" size="sm" />
                    ) : (
                      <TouchableOpacity
                        style={styles.markDeleteBtn}
                        onPress={() => onDecision(item, 'DELETE')}
                      >
                        <Text style={styles.markDeleteText}>Delete</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {activeTab === 'duplicates' && (
          <View>
            <Text style={styles.sectionHeading}>Candidate Duplicates</Text>
            <Text style={styles.sectionSubtitle}>
              Files matching exact byte size and media type across WhatsApp chats.
            </Text>

            {duplicates.length === 0 ? (
              <View style={styles.emptyDuplicates}>
                <Text style={styles.emptyIcon}>✨</Text>
                <Text style={styles.emptyTitle}>No Duplicates Detected</Text>
                <Text style={styles.emptySub}>
                  No identical-size files were found in your indexed WhatsApp media.
                </Text>
              </View>
            ) : (
              duplicates.map((group, gIdx) => (
                <Card key={gIdx} style={styles.dupCard}>
                  <View style={styles.dupHeader}>
                    <Text style={styles.dupTitle}>
                      {group.items.length} Identical Copies ({MediaDiscoveryService.formatBytes(group.size)} each)
                    </Text>
                    <Text style={styles.dupReclaim}>
                      Save {MediaDiscoveryService.formatBytes(group.potentialReclaimableBytes)}
                    </Text>
                  </View>

                  {group.items.map((item, idx) => {
                    const isMarked = decisions[item.id]?.decision === 'DELETE';
                    return (
                      <View key={item.id} style={styles.dupItemRow}>
                        <TouchableOpacity
                          style={styles.dupItemLeft}
                          onPress={() => setInspectItem(item)}
                        >
                          <Text style={styles.dupItemName} numberOfLines={1}>
                            {item.name} {idx === 0 ? '(Newest)' : '(Older)'}
                          </Text>
                          <Text style={styles.dupItemDate}>
                            {MediaDiscoveryService.formatDate(item.dateAdded)}
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.dupActionBtn, isMarked && styles.dupActionBtnMarked]}
                          onPress={() => onDecision(item, isMarked ? 'KEEP' : 'DELETE')}
                        >
                          <Text style={[styles.dupActionText, isMarked && styles.dupActionTextMarked]}>
                            {isMarked ? 'Delete Queued' : 'Mark Delete'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </Card>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* Enlarged Inspection Modal */}
      <EnlargedPreviewModal
        item={inspectItem}
        visible={!!inspectItem}
        onClose={() => setInspectItem(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  subTabsRow: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderSubtle,
  },
  subTab: {
    paddingVertical: 8,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radii.full,
    marginRight: theme.spacing.sm,
  },
  activeSubTab: {
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.borderDefault,
  },
  subTabText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  activeSubTabText: {
    color: theme.colors.accent,
    fontWeight: '700',
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxxl,
  },
  metricCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.md,
  },
  metricLabel: {
    ...theme.typography.label,
    color: theme.colors.textMuted,
  },
  metricValue: {
    ...theme.typography.display,
    color: theme.colors.textPrimary,
    marginVertical: 4,
  },
  metricSub: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  halfCard: {
    width: '48%',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
  },
  cardBigNumber: {
    ...theme.typography.h1,
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.sm,
  },
  cardSizeLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  queueCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderColor: 'rgba(239, 68, 68, 0.25)',
    padding: theme.spacing.lg,
  },
  queueCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  queueLabel: {
    ...theme.typography.label,
    color: theme.colors.dangerLight,
  },
  queueValue: {
    ...theme.typography.h2,
    color: theme.colors.textPrimary,
    marginTop: 2,
  },
  queueSub: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  arrowIcon: {
    fontSize: 24,
    color: theme.colors.dangerLight,
  },
  sectionHeading: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  sectionSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.lg,
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    marginBottom: theme.spacing.sm,
  },
  fileLeft: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  fileName: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  fileMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  fileMetaText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.sm,
  },
  decisionBadgeBox: {
    alignItems: 'flex-end',
  },
  markDeleteBtn: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 4,
    borderRadius: theme.radii.full,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: theme.colors.danger,
  },
  markDeleteText: {
    ...theme.typography.caption,
    color: theme.colors.dangerLight,
    fontWeight: '700',
  },
  emptyDuplicates: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: theme.spacing.md,
  },
  emptyTitle: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
  },
  emptySub: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  dupCard: {
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
  },
  dupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderSubtle,
  },
  dupTitle: {
    ...theme.typography.caption,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    flex: 1,
  },
  dupReclaim: {
    ...theme.typography.caption,
    fontWeight: '700',
    color: theme.colors.accent,
  },
  dupItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  dupItemLeft: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  dupItemName: {
    ...theme.typography.caption,
    color: theme.colors.textPrimary,
    fontWeight: '500',
  },
  dupItemDate: {
    ...theme.typography.caption,
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  dupActionBtn: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.radii.sm,
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.borderDefault,
  },
  dupActionBtnMarked: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: theme.colors.danger,
  },
  dupActionText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  dupActionTextMarked: {
    color: theme.colors.dangerLight,
  },
});
