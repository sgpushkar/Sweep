import { AppInfo, DownloadProgress, DownloadResult, ReleaseManifest } from '../types/update';
import { WhatsAppCleanerNativeBridge } from '../native/WhatsAppCleanerNative';

export class UpdateService {
  /**
   * Fetches and validates a remote release manifest over HTTPS.
   */
  static async fetchReleaseManifest(manifestUrl: string): Promise<ReleaseManifest> {
    if (!manifestUrl || !manifestUrl.startsWith('https://')) {
      throw new Error('Manifest URL must use secure HTTPS protocol');
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(manifestUrl, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch release manifest: HTTP ${response.status}`);
      }

      const json = await response.json();
      return this.validateManifest(json);
    } catch (e: any) {
      if (e.name === 'AbortError') {
        throw new Error('Request timed out while checking for updates');
      }
      throw e;
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Validates manifest structure and ensures required fields are correct.
   */
  static validateManifest(data: any): ReleaseManifest {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid manifest: root is not an object');
    }

    if (!data.versionName || typeof data.versionName !== 'string') {
      throw new Error('Invalid manifest: missing versionName');
    }

    if (!data.apkUrl || typeof data.apkUrl !== 'string' || !data.apkUrl.startsWith('https://')) {
      throw new Error('Invalid manifest: apkUrl must be a valid HTTPS URL');
    }

    return {
      applicationId: data.applicationId || 'com.whatsappmediacleaner',
      versionCode: typeof data.versionCode === 'number' ? data.versionCode : 1,
      versionName: data.versionName.trim(),
      releaseDate: data.releaseDate || new Date().toISOString().split('T')[0],
      minSdkVersion: typeof data.minSdkVersion === 'number' ? data.minSdkVersion : 26,
      apkUrl: data.apkUrl.trim(),
      apkSizeBytes: typeof data.apkSizeBytes === 'number' ? data.apkSizeBytes : null,
      sha256: typeof data.sha256 === 'string' && data.sha256.length === 64 ? data.sha256.trim() : null,
      releaseNotes: Array.isArray(data.releaseNotes) ? data.releaseNotes : [],
      repoUrl: data.repoUrl || null,
      support: data.support || null,
      privacyUrl: data.privacyUrl || null,
    };
  }

  /**
   * Compares the installed app version against the latest available release manifest.
   * Returns true if a newer version is available.
   */
  static isUpdateAvailable(installed: AppInfo, latest: ReleaseManifest): boolean {
    if (latest.versionCode > installed.versionCode) {
      return true;
    }

    return this.compareSemVer(latest.versionName, installed.versionName) > 0;
  }

  /**
   * Basic SemVer comparison (e.g. 1.2.0 vs 1.1.9).
   */
  static compareSemVer(v1: string, v2: string): number {
    const clean1 = v1.replace(/^v/, '').split('.').map(Number);
    const clean2 = v2.replace(/^v/, '').split('.').map(Number);

    const length = Math.max(clean1.length, clean2.length);
    for (let i = 0; i < length; i++) {
      const num1 = clean1[i] || 0;
      const num2 = clean2[i] || 0;
      if (num1 > num2) return 1;
      if (num1 < num2) return -1;
    }
    return 0;
  }

  /**
   * Initiates APK download and monitors progress.
   */
  static async downloadApk(
    url: string,
    expectedSha256: string | null,
    onProgress?: (p: DownloadProgress) => void
  ): Promise<DownloadResult> {
    let sub: any = null;
    if (onProgress) {
      sub = WhatsAppCleanerNativeBridge.onDownloadProgress(onProgress);
    }

    try {
      const result = await WhatsAppCleanerNativeBridge.downloadApk(url, expectedSha256);
      return result;
    } finally {
      if (sub && typeof sub.remove === 'function') {
        sub.remove();
      }
    }
  }

  /**
   * Launches Android installation intent.
   */
  static async installApk(filePath: string): Promise<boolean> {
    const canInstall = await WhatsAppCleanerNativeBridge.canInstallPackages();
    if (!canInstall) {
      await WhatsAppCleanerNativeBridge.openInstallPermissionSettings();
      return false;
    }
    return await WhatsAppCleanerNativeBridge.installApk(filePath);
  }
}
