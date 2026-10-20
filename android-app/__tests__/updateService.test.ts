import { UpdateService } from '../src/services/updateService';
import { AppInfo, ReleaseManifest } from '../src/types/update';

describe('UpdateService', () => {
  const installedApp: AppInfo = {
    packageName: 'com.whatsappmediacleaner',
    versionName: '1.0.0',
    versionCode: 1,
    minSdkVersion: 26,
    targetSdkVersion: 35,
  };

  describe('validateManifest', () => {
    it('validates a complete valid manifest over HTTPS', () => {
      const raw = {
        applicationId: 'com.whatsappmediacleaner',
        versionCode: 2,
        versionName: '1.1.0',
        releaseDate: '2026-10-13',
        minSdkVersion: 26,
        apkUrl: 'https://example.com/releases/app.apk',
        apkSizeBytes: 12500000,
        sha256: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2',
        releaseNotes: ['Feature A', 'Feature B'],
      };

      const manifest = UpdateService.validateManifest(raw);
      expect(manifest.versionName).toBe('1.1.0');
      expect(manifest.versionCode).toBe(2);
      expect(manifest.apkUrl).toBe('https://example.com/releases/app.apk');
      expect(manifest.sha256).toHaveLength(64);
    });

    it('rejects manifests with insecure non-HTTPS apkUrl', () => {
      const insecure = {
        versionName: '1.1.0',
        apkUrl: 'http://insecure.example.com/app.apk',
      };

      expect(() => UpdateService.validateManifest(insecure)).toThrow(
        /apkUrl must be a valid HTTPS URL/
      );
    });

    it('rejects manifests without versionName', () => {
      const invalid = {
        apkUrl: 'https://example.com/app.apk',
      };

      expect(() => UpdateService.validateManifest(invalid)).toThrow(
        /missing versionName/
      );
    });
  });

  describe('compareSemVer and isUpdateAvailable', () => {
    it('detects newer version by higher versionCode', () => {
      const manifest: ReleaseManifest = {
        applicationId: 'com.whatsappmediacleaner',
        versionCode: 2,
        versionName: '1.0.0',
        releaseDate: '2026-10-13',
        minSdkVersion: 26,
        apkUrl: 'https://example.com/app.apk',
        apkSizeBytes: 1000,
        sha256: null,
        releaseNotes: [],
      };

      expect(UpdateService.isUpdateAvailable(installedApp, manifest)).toBe(true);
    });

    it('detects newer version by semver string', () => {
      const manifest: ReleaseManifest = {
        applicationId: 'com.whatsappmediacleaner',
        versionCode: 1,
        versionName: '1.2.0',
        releaseDate: '2026-10-13',
        minSdkVersion: 26,
        apkUrl: 'https://example.com/app.apk',
        apkSizeBytes: 1000,
        sha256: null,
        releaseNotes: [],
      };

      expect(UpdateService.isUpdateAvailable(installedApp, manifest)).toBe(true);
    });

    it('reports up-to-date when versions match', () => {
      const manifest: ReleaseManifest = {
        applicationId: 'com.whatsappmediacleaner',
        versionCode: 1,
        versionName: '1.0.0',
        releaseDate: '2026-10-13',
        minSdkVersion: 26,
        apkUrl: 'https://example.com/app.apk',
        apkSizeBytes: 1000,
        sha256: null,
        releaseNotes: [],
      };

      expect(UpdateService.isUpdateAvailable(installedApp, manifest)).toBe(false);
    });

    it('reports no update when installed version is newer', () => {
      const manifest: ReleaseManifest = {
        applicationId: 'com.whatsappmediacleaner',
        versionCode: 0,
        versionName: '0.9.5',
        releaseDate: '2026-10-13',
        minSdkVersion: 26,
        apkUrl: 'https://example.com/app.apk',
        apkSizeBytes: 1000,
        sha256: null,
        releaseNotes: [],
      };

      expect(UpdateService.isUpdateAvailable(installedApp, manifest)).toBe(false);
    });
  });
});
