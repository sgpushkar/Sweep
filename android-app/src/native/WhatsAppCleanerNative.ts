import { NativeModules, DeviceEventEmitter, EmitterSubscription, Platform } from 'react-native';
import { DeleteResult, MediaItem, PermissionStatus, ScanSummary } from '../types/media';
import { AppInfo, DownloadProgress, DownloadResult } from '../types/update';

const { WhatsAppCleanerNative } = NativeModules;

export class WhatsAppCleanerNativeBridge {
  private static isAvailable(): boolean {
    return Platform.OS === 'android' && !!WhatsAppCleanerNative;
  }

  // ---------------------------------------------------------------------------
  // Permissions
  // ---------------------------------------------------------------------------

  static async checkMediaPermissions(): Promise<PermissionStatus> {
    if (!this.isAvailable()) {
      return {
        status: 'granted',
        canReadImages: true,
        canReadVideos: true,
        isPartialAccess: false,
        apiLevel: 35,
      };
    }
    return await WhatsAppCleanerNative.checkMediaPermissions();
  }

  static async requestMediaPermissions(): Promise<void> {
    if (!this.isAvailable()) return;
    return await WhatsAppCleanerNative.requestMediaPermissions();
  }

  static async openAppSettings(): Promise<boolean> {
    if (!this.isAvailable()) return false;
    return await WhatsAppCleanerNative.openAppSettings();
  }

  // ---------------------------------------------------------------------------
  // Media Discovery
  // ---------------------------------------------------------------------------

  static async scanWhatsAppMedia(options?: Record<string, any>): Promise<ScanSummary> {
    if (!this.isAvailable()) {
      // In dev/test fallback
      return {
        totalCount: 0,
        imageCount: 0,
        videoCount: 0,
        totalSizeBytes: 0,
        items: [],
        scannedAt: Date.now(),
        permissionStatus: 'granted',
      };
    }

    const res = await WhatsAppCleanerNative.scanWhatsAppMedia(options || null);
    return {
      ...res,
      scannedAt: Date.now(),
    };
  }

  static async pickWhatsAppFolder(): Promise<string> {
    if (!this.isAvailable()) throw new Error('SAF only available on Android');
    return await WhatsAppCleanerNative.pickWhatsAppFolder();
  }

  static async scanDocumentFolder(treeUri: string): Promise<ScanSummary> {
    if (!this.isAvailable()) throw new Error('SAF only available on Android');
    const res = await WhatsAppCleanerNative.scanDocumentFolder(treeUri);
    return {
      totalCount: res.totalCount,
      imageCount: res.items.filter((i: MediaItem) => i.mediaType === 'image').length,
      videoCount: res.items.filter((i: MediaItem) => i.mediaType === 'video').length,
      totalSizeBytes: res.totalSizeBytes,
      items: res.items,
      scannedAt: Date.now(),
    };
  }

  static async getThumbnail(uri: string, isVideo: boolean): Promise<string | null> {
    if (!this.isAvailable()) return null;
    try {
      return await WhatsAppCleanerNative.getThumbnail(uri, isVideo);
    } catch {
      return null;
    }
  }

  static async prefetchThumbnails(items: Array<{ uri: string; isVideo: boolean }>): Promise<boolean> {
    if (!this.isAvailable()) return false;
    try {
      return await WhatsAppCleanerNative.prefetchThumbnails(items);
    } catch {
      return false;
    }
  }

  static async openMedia(uri: string, mimeType: string = ''): Promise<boolean> {
    if (!this.isAvailable()) return false;
    try {
      return await WhatsAppCleanerNative.openMedia(uri, mimeType);
    } catch {
      return false;
    }
  }

  // ---------------------------------------------------------------------------
  // Deletion Authorization
  // ---------------------------------------------------------------------------

  static async deleteMediaItems(uris: string[]): Promise<DeleteResult> {
    if (!this.isAvailable()) {
      return {
        status: 'completed',
        requestedCount: uris.length,
        deletedCount: uris.length,
        deletedUris: uris,
        failedUris: [],
      };
    }
    return await WhatsAppCleanerNative.deleteMediaItems(uris);
  }

  // ---------------------------------------------------------------------------
  // App Info & Updates
  // ---------------------------------------------------------------------------

  static async getAppInfo(): Promise<AppInfo> {
    if (!this.isAvailable()) {
      return {
        packageName: 'com.whatsappmediacleaner',
        versionName: '1.0.0',
        versionCode: 1,
        minSdkVersion: 26,
        targetSdkVersion: 35,
      };
    }
    return await WhatsAppCleanerNative.getAppInfo();
  }

  static async canInstallPackages(): Promise<boolean> {
    if (!this.isAvailable()) return true;
    return await WhatsAppCleanerNative.canInstallPackages();
  }

  static async openInstallPermissionSettings(): Promise<boolean> {
    if (!this.isAvailable()) return false;
    return await WhatsAppCleanerNative.openInstallPermissionSettings();
  }

  static async downloadApk(url: string, expectedSha256?: string | null): Promise<DownloadResult> {
    if (!this.isAvailable()) {
      throw new Error('APK download is only supported on Android devices');
    }
    return await WhatsAppCleanerNative.downloadApk(url, expectedSha256 || null);
  }

  static async cancelDownload(): Promise<boolean> {
    if (!this.isAvailable()) return false;
    return await WhatsAppCleanerNative.cancelDownload();
  }

  static onDownloadProgress(listener: (progress: DownloadProgress) => void): EmitterSubscription {
    return DeviceEventEmitter.addListener('onDownloadProgress', listener);
  }

  static async installApk(filePath: string): Promise<boolean> {
    if (!this.isAvailable()) {
      throw new Error('APK install is only supported on Android devices');
    }
    return await WhatsAppCleanerNative.installApk(filePath);
  }

  // ---------------------------------------------------------------------------
  // Persistent Storage
  // ---------------------------------------------------------------------------

  static async saveData(key: string, data: any): Promise<boolean> {
    const json = JSON.stringify(data);
    if (!this.isAvailable()) {
      // Memory fallback in test
      return true;
    }
    return await WhatsAppCleanerNative.saveData(key, json);
  }

  static async loadData<T>(key: string): Promise<T | null> {
    if (!this.isAvailable()) {
      return null;
    }
    const json = await WhatsAppCleanerNative.loadData(key);
    if (!json) return null;
    try {
      return JSON.parse(json) as T;
    } catch {
      return null;
    }
  }
}
