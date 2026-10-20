import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { theme } from '../theme/theme';
import { Header } from '../components/common/Header';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { QueueItem } from '../components/queue/QueueItem';
import { QueueSummary } from '../components/queue/QueueSummary';
import { EnlargedPreviewModal } from '../components/review/EnlargedPreviewModal';
import { MediaItem, ReviewDecisionMap } from '../types/media';
import { DeletionManager } from '../services/deletionManager';
import { MediaDiscoveryService } from '../services/mediaDiscovery';
import { useAppNavigation } from '../navigation/NavigationContext';

interface QueueScreenProps {
  items: MediaItem[];
  decisions: ReviewDecisionMap;
  onPostDelete: (deletedUris: string[]) => void;
}

export const QueueScreen: React.FC<QueueScreenProps> = ({
  items,
  decisions,
  onPostDelete,
}) => {
  const { goBack } = useAppNavigation();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(
      items
        .filter(i => decisions[i.id]?.decision === 'DELETE')
        .map(i => i.id)
    )
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [inspectItem, setInspectItem] = useState<MediaItem | null>(null);

  const deleteCandidates = items.filter(i => decisions[i.id]?.decision === 'DELETE');
  const selectedItems = deleteCandidates.filter(i => selectedIds.has(i.id));

  const totalCandidateBytes = DeletionManager.calculateReclaimableSize(deleteCandidates);
  const selectedBytes = DeletionManager.calculateReclaimableSize(selectedItems);

  const toggleSelect = (item: MediaItem) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(item.id)) {
        next.delete(item.id);
      } else {
        next.add(item.id);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(deleteCandidates.map(i => i.id)));
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  const handleStartDeletion = () => {
    if (selectedItems.length === 0) return;

    Alert.alert(
      'Confirm Safe Deletion',
      `You are about to delete ${selectedItems.length} items (${MediaDiscoveryService.formatBytes(
        selectedBytes
      )}).\n\nAndroid will display its official system authorization dialog to confirm permission.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Proceed to Android Dialog',
          style: 'destructive',
          onPress: executeDeletion,
        },
      ]
    );
  };

  const executeDeletion = async () => {
    setIsDeleting(true);
    try {
      const result = await DeletionManager.executeSafeDeletion(selectedItems);

      if (result.status === 'completed' || result.status === 'partial') {
        onPostDelete(result.deletedUris);
        Alert.alert(
          'Cleanup Result',
          `Successfully verified and removed ${result.deletedCount} items.${
            result.failedUris.length > 0
              ? `\n${result.failedUris.length} items could not be deleted or were skipped.`
              : ''
          }`
        );
      } else if (result.status === 'cancelled') {
        Alert.alert(
          'Deletion Cancelled',
          'The Android system deletion dialog was cancelled. No files were removed from your device.'
        );
      } else if (result.status === 'error') {
        Alert.alert('Deletion Error', result.errorMessage || 'An error occurred during deletion.');
      }
    } catch (e: any) {
      Alert.alert('Deletion Error', e.message || 'Failed to complete system deletion.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Deletion Queue"
        subtitle={`${deleteCandidates.length} candidate items`}
        onBack={() => goBack()}
      />

      {deleteCandidates.length === 0 ? (
        <View style={styles.emptyContainer}>
          <EmptyState
            icon="✨"
            title="Queue is Empty"
            description="You haven't marked any media items for deletion yet. Swipe left during review to add items here."
            actionLabel="Return to Cleaner"
            onAction={() => goBack()}
          />
        </View>
      ) : (
        <View style={styles.content}>
          <FlatList
            data={deleteCandidates}
            keyExtractor={item => item.id}
            ListHeaderComponent={
              <QueueSummary
                totalCount={deleteCandidates.length}
                selectedCount={selectedItems.length}
                selectedBytes={selectedBytes}
                onSelectAll={selectAll}
                onDeselectAll={deselectAll}
              />
            }
            renderItem={({ item }) => (
              <QueueItem
                item={item}
                isSelected={selectedIds.has(item.id)}
                onToggleSelect={toggleSelect}
                onPressPreview={it => setInspectItem(it)}
              />
            )}
            contentContainerStyle={styles.listContent}
          />

          {/* Action Bar */}
          <View style={styles.bottomBar}>
            <Button
              label={
                isDeleting
                  ? 'Requesting Android Authorization...'
                  : selectedItems.length > 0
                  ? `Delete ${selectedItems.length} Items Safely`
                  : 'Select Items to Delete'
              }
              variant="danger"
              icon="🗑️"
              onPress={handleStartDeletion}
              disabled={selectedItems.length === 0 || isDeleting}
              loading={isDeleting}
            />
          </View>
        </View>
      )}

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
  content: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: theme.spacing.lg,
    paddingBottom: 90,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderSubtle,
  },
});
