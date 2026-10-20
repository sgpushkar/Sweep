import { DeleteResult, MediaItem, ReviewDecisionMap } from '../types/media';
import { WhatsAppCleanerNativeBridge } from '../native/WhatsAppCleanerNative';
import { SessionStore } from '../storage/sessionStore';

export class DeletionManager {
  /**
   * Filters media items to find candidates marked for deletion.
   */
  static getDeletionCandidates(
    items: MediaItem[],
    decisions: ReviewDecisionMap
  ): MediaItem[] {
    return items.filter(item => decisions[item.id]?.decision === 'DELETE');
  }

  /**
   * Calculates the total reclaimable size of a list of media items.
   */
  static calculateReclaimableSize(items: MediaItem[]): number {
    return items.reduce((acc, curr) => acc + (curr.size || 0), 0);
  }

  /**
   * Safely executes Android system-authorized deletion for the selected items.
   * Only deletes URIs that were explicitly marked for deletion.
   * Verifies results afterwards and updates local session storage.
   */
  static async executeSafeDeletion(
    selectedItems: MediaItem[]
  ): Promise<DeleteResult> {
    if (selectedItems.length === 0) {
      return {
        status: 'completed',
        requestedCount: 0,
        deletedCount: 0,
        deletedUris: [],
        failedUris: [],
      };
    }

    const urisToDelete = selectedItems.map(item => item.uri);

    try {
      const result = await WhatsAppCleanerNativeBridge.deleteMediaItems(urisToDelete);

      if (result.deletedUris && result.deletedUris.length > 0) {
        // Remove successfully deleted items from session decisions
        const session = await SessionStore.loadSession();
        const deletedSet = new Set(result.deletedUris);

        for (const item of selectedItems) {
          if (deletedSet.has(item.uri)) {
            delete session.decisions[item.id];
          }
        }

        await SessionStore.saveSession(session);
      }

      return result;
    } catch (error: any) {
      return {
        status: 'error',
        requestedCount: selectedItems.length,
        deletedCount: 0,
        deletedUris: [],
        failedUris: urisToDelete,
        errorMessage: error.message || 'System deletion failed',
      };
    }
  }
}
