import { MediaItem, ReviewDecisionMap, ScanSummary } from '../types/media';
import { WhatsAppCleanerNativeBridge } from '../native/WhatsAppCleanerNative';
import { SessionStore } from '../storage/sessionStore';

export class MediaDiscoveryService {
  /**
   * Discovers WhatsApp media using MediaStore, with automatic permission checking
   * and reconciliation against persistent review decisions.
   */
  static async scanMedia(): Promise<ScanSummary> {
    const permStatus = await WhatsAppCleanerNativeBridge.checkMediaPermissions();

    if (permStatus.status === 'denied') {
      return {
        totalCount: 0,
        imageCount: 0,
        videoCount: 0,
        totalSizeBytes: 0,
        items: [],
        scannedAt: Date.now(),
        isPartialAccess: false,
        permissionStatus: 'denied',
      };
    }

    const summary = await WhatsAppCleanerNativeBridge.scanWhatsAppMedia();
    summary.isPartialAccess = permStatus.isPartialAccess;
    summary.permissionStatus = permStatus.status;

    // Cache the scan result
    await SessionStore.saveScanCache(summary);

    return summary;
  }

  /**
   * Sorts media items according to the user's preference.
   */
  static sortMedia(
    items: MediaItem[],
    sortBy: 'date_desc' | 'date_asc' | 'size_desc' | 'size_asc' = 'date_desc'
  ): MediaItem[] {
    const copy = [...items];
    switch (sortBy) {
      case 'date_desc':
        return copy.sort((a, b) => (b.dateAdded || 0) - (a.dateAdded || 0));
      case 'date_asc':
        return copy.sort((a, b) => (a.dateAdded || 0) - (b.dateAdded || 0));
      case 'size_desc':
        return copy.sort((a, b) => b.size - a.size);
      case 'size_asc':
        return copy.sort((a, b) => a.size - b.size);
      default:
        return copy;
    }
  }

  /**
   * Formats raw bytes into a human-readable string.
   */
  static formatBytes(bytes: number, decimals: number = 1): string {
    if (bytes <= 0 || isNaN(bytes)) return '0 B';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const val = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));
    return `${val} ${sizes[i] || 'B'}`;
  }

  /**
   * Formats video duration in ms to mm:ss format.
   */
  static formatDuration(ms?: number): string {
    if (!ms || ms <= 0) return '0:00';
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  }

  /**
   * Formats unix timestamp in seconds to a date string.
   */
  static formatDate(timestampInSec: number): string {
    if (!timestampInSec) return 'Unknown date';
    const date = new Date(timestampInSec * 1000);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
}
