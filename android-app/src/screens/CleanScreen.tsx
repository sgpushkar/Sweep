import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { theme } from '../theme/theme';
import { MediaItem, ReviewDecision, ReviewDecisionMap } from '../types/media';
import { SwipeCard } from '../components/review/SwipeCard';
import { ReviewControls } from '../components/review/ReviewControls';
import { EnlargedPreviewModal } from '../components/review/EnlargedPreviewModal';
import { ProgressBar } from '../components/common/ProgressBar';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { useAppNavigation } from '../navigation/NavigationContext';

interface CleanScreenProps {
  items: MediaItem[];
  decisions: ReviewDecisionMap;
  currentIndex: number;
  canUndo: boolean;
  hapticEnabled?: boolean;
  onDecision: (item: MediaItem, decision: ReviewDecision) => void;
  onUndo: () => void;
  onSkip: () => void;
  onScan: () => void;
}

export const CleanScreen: React.FC<CleanScreenProps> = ({
  items,
  decisions,
  currentIndex,
  canUndo,
  hapticEnabled = true,
  onDecision,
  onUndo,
  onSkip,
  onScan,
}) => {
  const { navigateTo, navigateTab } = useAppNavigation();
  const [inspectItem, setInspectItem] = useState<MediaItem | null>(null);

  const totalCount = items.length;
  const currentItem = items[currentIndex];
  const isFinished = totalCount > 0 && currentIndex >= totalCount;

  const deleteCount = Object.values(decisions || {}).filter(d => d?.decision === 'DELETE').length;
  const progressPercent = totalCount > 0 ? (currentIndex / totalCount) * 100 : 0;

  if (totalCount === 0) {
    return (
      <View style={styles.centerContainer}>
        <EmptyState
          icon="🔍"
          title="No Media to Clean"
          description="Scan your WhatsApp library to discover images and videos to review."
          actionLabel="Scan WhatsApp Media"
          onAction={onScan}
        />
      </View>
    );
  }

  if (isFinished) {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.finishedCard}>
          <Text style={styles.finishedIcon}>🎉</Text>
          <Text style={styles.finishedTitle}>Review Complete</Text>
          <Text style={styles.finishedSubtitle}>
            You have reviewed all {totalCount} discovered media items.
          </Text>

          {deleteCount > 0 ? (
            <View style={styles.queueNoticeBox}>
              <Text style={styles.queueNoticeText}>
                {deleteCount} {deleteCount === 1 ? 'item is' : 'items are'} waiting in the deletion queue.
              </Text>
              <Button
                label={`Inspect Deletion Queue (${deleteCount})`}
                variant="danger"
                onPress={() => navigateTo('queue')}
                style={styles.finishActionButton}
              />
            </View>
          ) : (
            <Text style={styles.noDeleteText}>
              No items were marked for deletion.
            </Text>
          )}

          <Button
            label="Return to Dashboard"
            variant="secondary"
            onPress={() => navigateTab('home')}
            style={styles.finishHomeButton}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Top Header Progress Bar */}
      <View style={styles.progressHeader}>
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>
            Item {currentIndex + 1} of {totalCount}
          </Text>
          <Text style={styles.progressPercentText}>
            {Math.round(progressPercent)}%
          </Text>
        </View>
        <ProgressBar progress={progressPercent} height={4} />
      </View>

      {/* Main Swipeable Card Deck View */}
      <View style={styles.cardArea}>
        {currentItem ? (
          <SwipeCard
            key={currentItem.id}
            item={currentItem}
            onSwipeLeft={item => onDecision(item, 'DELETE')}
            onSwipeRight={item => onDecision(item, 'KEEP')}
            onTapPreview={item => setInspectItem(item)}
            hapticEnabled={hapticEnabled}
          />
        ) : null}
      </View>

      {/* Tactile Review Controls */}
      <ReviewControls
        onDelete={() => currentItem && onDecision(currentItem, 'DELETE')}
        onKeep={() => currentItem && onDecision(currentItem, 'KEEP')}
        onSkip={onSkip}
        onUndo={onUndo}
        canUndo={canUndo}
        hapticEnabled={hapticEnabled}
      />

      {/* Full-screen Inspection Modal */}
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
  centerContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  progressHeader: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },
  progressLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  progressPercentText: {
    ...theme.typography.caption,
    color: theme.colors.accent,
    fontWeight: '700',
  },
  cardArea: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  finishedCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.xl,
    padding: theme.spacing.xxl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  finishedIcon: {
    fontSize: 48,
    marginBottom: theme.spacing.md,
  },
  finishedTitle: {
    ...theme.typography.h2,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  finishedSubtitle: {
    ...theme.typography.bodySecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  queueNoticeBox: {
    width: '100%',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderRadius: theme.radii.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    marginBottom: theme.spacing.lg,
    alignItems: 'center',
  },
  queueNoticeText: {
    ...theme.typography.caption,
    color: theme.colors.dangerLight,
    fontWeight: '600',
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  noDeleteText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xl,
  },
  finishActionButton: {
    width: '100%',
  },
  finishHomeButton: {
    width: '100%',
  },
});
