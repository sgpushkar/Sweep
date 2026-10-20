import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { theme } from '../theme/theme';
import { Header } from '../components/common/Header';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ProgressBar } from '../components/common/ProgressBar';
import { AppInfo, DownloadProgress, DownloadResult, ReleaseManifest, UpdateCheckState } from '../types/update';
import { UpdateService } from '../services/updateService';
import { WhatsAppCleanerNativeBridge } from '../native/WhatsAppCleanerNative';
import { MediaDiscoveryService } from '../services/mediaDiscovery';
import { useAppNavigation } from '../navigation/NavigationContext';

interface UpdateScreenProps {
  initialManifestUrl: string;
  onUpdateManifestUrl: (url: string) => void;
}

export const UpdateScreen: React.FC<UpdateScreenProps> = ({
  initialManifestUrl,
  onUpdateManifestUrl,
}) => {
  const { goBack } = useAppNavigation();
  const [manifestUrl, setManifestUrl] = useState(initialManifestUrl);
  const [appInfo, setAppInfo] = useState<AppInfo | null>(null);
  const [manifest, setManifest] = useState<ReleaseManifest | null>(null);
  const [state, setState] = useState<UpdateCheckState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress>({
    percent: 0,
    downloadedBytes: 0,
    totalBytes: 0,
  });
  const [downloadResult, setDownloadResult] = useState<DownloadResult | null>(null);

  useEffect(() => {
    loadAppInfo();
  }, []);

  const loadAppInfo = async () => {
    try {
      const info = await WhatsAppCleanerNativeBridge.getAppInfo();
      setAppInfo(info);
    } catch {
      setAppInfo({
        packageName: 'com.whatsappmediacleaner',
        versionName: '1.0.0',
        versionCode: 1,
        minSdkVersion: 26,
        targetSdkVersion: 35,
      });
    }
  };

  const checkForUpdates = async () => {
    setState('checking');
    setErrorMessage(null);
    setManifest(null);
    setDownloadResult(null);

    try {
      const release = await UpdateService.fetchReleaseManifest(manifestUrl);
      setManifest(release);

      if (appInfo && UpdateService.isUpdateAvailable(appInfo, release)) {
        setState('update_available');
      } else {
        setState('up_to_date');
      }
    } catch (e: any) {
      setState('error');
      setErrorMessage(e.message || 'Failed to check for updates');
    }
  };

  const handleDownload = async () => {
    if (!manifest || !manifest.apkUrl) return;

    setState('downloading');
    setErrorMessage(null);
    setDownloadProgress({ percent: 0, downloadedBytes: 0, totalBytes: 0 });

    try {
      const result = await UpdateService.downloadApk(
        manifest.apkUrl,
        manifest.sha256,
        progress => {
          setDownloadProgress(progress);
        }
      );

      setDownloadResult(result);
      setState('ready_to_install');
    } catch (e: any) {
      if (e.message?.includes('CANCELLED')) {
        setState('update_available');
      } else {
        setState('error');
        setErrorMessage(e.message || 'APK download failed');
      }
    }
  };

  const handleCancelDownload = async () => {
    await WhatsAppCleanerNativeBridge.cancelDownload();
    setState('update_available');
  };

  const handleInstall = async () => {
    if (!downloadResult || !downloadResult.filePath) return;

    try {
      const launched = await UpdateService.installApk(downloadResult.filePath);
      if (!launched) {
        Alert.alert(
          'Install Permission Required',
          'Please grant "Allow from this source" in Android system settings to install downloaded APKs, then tap Install again.'
        );
      }
    } catch (e: any) {
      Alert.alert('Installation Error', e.message || 'Failed to start package installer');
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="APK Release & Update"
        subtitle="In-app distribution channel"
        onBack={() => goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Installed Version Box */}
        <Card style={styles.versionCard}>
          <Text style={styles.cardEyebrow}>INSTALLED APPLICATION</Text>
          <View style={styles.versionRow}>
            <Text style={styles.versionName}>
              v{appInfo?.versionName || '1.0.0'}
            </Text>
            <Badge label={`Build ${appInfo?.versionCode || 1}`} variant="neutral" />
          </View>
          <Text style={styles.packageIdText}>{appInfo?.packageName}</Text>
        </Card>

        {/* Manifest Source Configuration */}
        <Card style={styles.configCard}>
          <Text style={styles.configLabel}>RELEASE MANIFEST URL (HTTPS)</Text>
          <TextInput
            style={styles.urlInput}
            value={manifestUrl}
            onChangeText={txt => {
              setManifestUrl(txt);
              onUpdateManifestUrl(txt);
            }}
            placeholder="https://..."
            placeholderTextColor={theme.colors.textDisabled}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Button
            label={state === 'checking' ? 'Checking Server...' : 'Check for Updates'}
            icon="🔄"
            onPress={checkForUpdates}
            loading={state === 'checking'}
            variant="secondary"
            style={styles.checkButton}
          />
        </Card>

        {/* Error State */}
        {state === 'error' && errorMessage && (
          <Card style={styles.errorCard}>
            <Text style={styles.errorTitle}>Update Check Failed</Text>
            <Text style={styles.errorMessage}>{errorMessage}</Text>
            <Button
              label="Retry Check"
              variant="outline"
              onPress={checkForUpdates}
              style={styles.retryBtn}
            />
          </Card>
        )}

        {/* Up-to-date State */}
        {state === 'up_to_date' && manifest && (
          <Card style={styles.upToDateCard}>
            <Text style={styles.upToDateIcon}>✓</Text>
            <Text style={styles.upToDateTitle}>Your App is Up to Date</Text>
            <Text style={styles.upToDateSub}>
              Installed version {appInfo?.versionName} matches the latest release ({manifest.versionName}).
            </Text>
          </Card>
        )}

        {/* Update Available / Download / Ready States */}
        {manifest && (state === 'update_available' || state === 'downloading' || state === 'ready_to_install') && (
          <Card style={styles.releaseCard}>
            <View style={styles.releaseHeaderRow}>
              <View>
                <Badge label="NEW RELEASE" variant="accent" size="sm" />
                <Text style={styles.releaseVersion}>v{manifest.versionName}</Text>
              </View>
              <View style={styles.releaseMetaRight}>
                <Text style={styles.releaseDateText}>{manifest.releaseDate}</Text>
                {manifest.apkSizeBytes && (
                  <Text style={styles.releaseSizeText}>
                    {MediaDiscoveryService.formatBytes(manifest.apkSizeBytes)}
                  </Text>
                )}
              </View>
            </View>

            {/* Release Notes */}
            {manifest.releaseNotes && manifest.releaseNotes.length > 0 && (
              <View style={styles.notesBox}>
                <Text style={styles.notesTitle}>What's New:</Text>
                {manifest.releaseNotes.map((note, idx) => (
                  <Text key={idx} style={styles.noteItem}>
                    • {note}
                  </Text>
                ))}
              </View>
            )}

            {/* Downloading Progress Bar */}
            {state === 'downloading' && (
              <View style={styles.downloadProgressBox}>
                <ProgressBar
                  progress={downloadProgress.percent}
                  showLabel
                  color={theme.colors.accent}
                />
                <Text style={styles.downloadBytesText}>
                  {MediaDiscoveryService.formatBytes(downloadProgress.downloadedBytes)} /{' '}
                  {MediaDiscoveryService.formatBytes(downloadProgress.totalBytes)}
                </Text>
                <Button
                  label="Cancel Download"
                  variant="ghost"
                  onPress={handleCancelDownload}
                  style={styles.cancelBtn}
                />
              </View>
            )}

            {/* Verification / Ready to Install Box */}
            {state === 'ready_to_install' && downloadResult && (
              <View style={styles.verifiedBox}>
                <View style={styles.verifiedRow}>
                  <Text style={styles.verifiedIcon}>
                    {downloadResult.checksumVerified ? '🔒' : 'ℹ️'}
                  </Text>
                  <View style={styles.verifiedTextCol}>
                    <Text style={styles.verifiedTitle}>
                      {downloadResult.checksumVerified
                        ? 'SHA-256 Checksum Verified'
                        : 'Package Integrity Checked'}
                    </Text>
                    <Text style={styles.hashText} numberOfLines={1}>
                      {downloadResult.sha256}
                    </Text>
                  </View>
                </View>

                <Button
                  label="Install Update Now"
                  variant="primary"
                  icon="📦"
                  onPress={handleInstall}
                  style={styles.installButton}
                />
              </View>
            )}

            {/* Action Button for Downloading */}
            {state === 'update_available' && (
              <Button
                label="Download APK Update"
                variant="primary"
                icon="⬇️"
                onPress={handleDownload}
                style={styles.downloadButton}
              />
            )}
          </Card>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxxl,
  },
  versionCard: {
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.md,
  },
  cardEyebrow: {
    ...theme.typography.label,
    color: theme.colors.textMuted,
  },
  versionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: theme.spacing.xs,
  },
  versionName: {
    ...theme.typography.h1,
    color: theme.colors.textPrimary,
  },
  packageIdText: {
    ...theme.typography.mono,
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
  configCard: {
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.md,
  },
  configLabel: {
    ...theme.typography.label,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  urlInput: {
    backgroundColor: theme.colors.backgroundElevated,
    borderWidth: 1,
    borderColor: theme.colors.borderDefault,
    borderRadius: theme.radii.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 10,
    color: theme.colors.textPrimary,
    fontFamily: 'monospace',
    fontSize: 12,
    marginBottom: theme.spacing.md,
  },
  checkButton: {
    height: 44,
  },
  errorCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderColor: theme.colors.danger,
    marginBottom: theme.spacing.md,
  },
  errorTitle: {
    ...theme.typography.h3,
    color: theme.colors.dangerLight,
    marginBottom: 4,
  },
  errorMessage: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  retryBtn: {
    height: 38,
  },
  upToDateCard: {
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    marginBottom: theme.spacing.md,
  },
  upToDateIcon: {
    fontSize: 36,
    color: theme.colors.accent,
    marginBottom: theme.spacing.sm,
  },
  upToDateTitle: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
  },
  upToDateSub: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 280,
  },
  releaseCard: {
    backgroundColor: theme.colors.surfaceElevated,
    borderColor: theme.colors.borderDefault,
    marginBottom: theme.spacing.md,
  },
  releaseHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  releaseVersion: {
    ...theme.typography.h2,
    color: theme.colors.textPrimary,
    marginTop: 4,
  },
  releaseMetaRight: {
    alignItems: 'flex-end',
  },
  releaseDateText: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },
  releaseSizeText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontWeight: '700',
    marginTop: 2,
  },
  notesBox: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  notesTitle: {
    ...theme.typography.caption,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 6,
  },
  noteItem: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    lineHeight: 18,
    marginBottom: 2,
  },
  downloadProgressBox: {
    marginVertical: theme.spacing.md,
  },
  downloadBytesText: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: 6,
  },
  cancelBtn: {
    marginTop: theme.spacing.sm,
  },
  verifiedBox: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.radii.md,
    marginBottom: theme.spacing.md,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  verifiedIcon: {
    fontSize: 20,
    marginRight: theme.spacing.md,
  },
  verifiedTextCol: {
    flex: 1,
  },
  verifiedTitle: {
    ...theme.typography.caption,
    fontWeight: '700',
    color: theme.colors.accent,
  },
  hashText: {
    ...theme.typography.mono,
    fontSize: 10,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  installButton: {
    height: 48,
  },
  downloadButton: {
    height: 48,
  },
});
