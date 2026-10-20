import React, { useEffect, useState } from 'react';
import { View, StyleSheet, StatusBar, SafeAreaView, Alert } from 'react-native';
import { theme } from './theme/theme';
import { NavigationProvider, useAppNavigation } from './navigation/NavigationContext';
import { BottomTabBar } from './components/common/BottomTabBar';
import { HomeScreen } from './screens/HomeScreen';
import { CleanScreen } from './screens/CleanScreen';
import { StorageScreen } from './screens/StorageScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { QueueScreen } from './screens/QueueScreen';
import { UpdateScreen } from './screens/UpdateScreen';
import { PrivacyScreen } from './screens/PrivacyScreen';

import { MediaItem, ReviewDecision, ReviewDecisionMap, ScanSummary } from './types/media';
import { DEFAULT_SETTINGS, UserSettings } from './types/settings';
import { MediaDiscoveryService } from './services/mediaDiscovery';
import { SessionStore } from './storage/sessionStore';
import { SettingsStore } from './storage/settingsStore';
import { WhatsAppCleanerNativeBridge } from './native/WhatsAppCleanerNative';

const MainNavigator: React.FC = () => {
  const { currentScreen, activeTab } = useAppNavigation();

  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [scanSummary, setScanSummary] = useState<ScanSummary | null>(null);
  const [decisions, setDecisions] = useState<ReviewDecisionMap>({});
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [canUndo, setCanUndo] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // 1. Load persisted settings
      const loadedSettings = await SettingsStore.loadSettings();
      setSettings(loadedSettings);

      // 2. Load persisted review session
      const savedSession = await SessionStore.loadSession();
      setDecisions(savedSession.decisions || {});
      setCurrentIndex(savedSession.currentIndex || 0);
      setCanUndo(savedSession.history && savedSession.history.length > 0);

      // 3. Load cached scan or perform initial discovery
      const cachedScan = await SessionStore.loadScanCache();
      if (cachedScan && cachedScan.items.length > 0) {
        setScanSummary(cachedScan);
      } else {
        await triggerScan();
      }
    } catch (e) {
      console.warn('Initialization error:', e);
    }
  };

  const triggerScan = async () => {
    setIsScanning(true);
    try {
      // Check permissions and scan
      const perms = await WhatsAppCleanerNativeBridge.checkMediaPermissions();
      if (perms.status === 'denied') {
        // Request permissions
        await WhatsAppCleanerNativeBridge.requestMediaPermissions();
      }

      const summary = await MediaDiscoveryService.scanMedia();
      setScanSummary(summary);
    } catch (e: any) {
      Alert.alert('Scan Alert', e.message || 'Failed to scan WhatsApp media.');
    } finally {
      setIsScanning(false);
    }
  };

  const handlePickFolder = async () => {
    try {
      const treeUri = await WhatsAppCleanerNativeBridge.pickWhatsAppFolder();
      if (treeUri) {
        setIsScanning(true);
        const folderSummary = await WhatsAppCleanerNativeBridge.scanDocumentFolder(treeUri);
        setScanSummary(folderSummary);
        await SessionStore.saveScanCache(folderSummary);
      }
    } catch (e: any) {
      if (!e.message?.includes('CANCELLED')) {
        Alert.alert('Folder Picker', e.message || 'Failed to access selected folder.');
      }
    } finally {
      setIsScanning(false);
    }
  };

  const handleDecision = async (item: MediaItem, decision: ReviewDecision) => {
    if (!item?.id) return;
    try {
      await SessionStore.recordDecision(item.id, decision);
      const updatedDecisions = await SessionStore.getDecisions();
      setDecisions({ ...updatedDecisions });
      setCurrentIndex(prev => prev + 1);
      setCanUndo(true);
    } catch (e) {
      console.warn('Failed to record decision:', e);
    }
  };

  const handleUndo = async () => {
    try {
      const undone = await SessionStore.undoLastDecision();
      if (undone) {
        const updatedDecisions = await SessionStore.getDecisions();
        setDecisions({ ...updatedDecisions });
        setCurrentIndex(prev => Math.max(0, prev - 1));
        const session = await SessionStore.loadSession();
        setCanUndo(session.history.length > 0);
      }
    } catch (e) {
      console.warn('Failed to undo decision:', e);
    }
  };

  const handleSkip = () => {
    setCurrentIndex(prev => prev + 1);
  };

  const handlePostDelete = (deletedUris: string[]) => {
    if (!scanSummary) return;
    const deletedSet = new Set(deletedUris);
    const remainingItems = scanSummary.items.filter(i => !deletedSet.has(i.uri));

    const updatedSummary: ScanSummary = {
      ...scanSummary,
      items: remainingItems,
      totalCount: remainingItems.length,
      imageCount: remainingItems.filter(i => i.mediaType === 'image').length,
      videoCount: remainingItems.filter(i => i.mediaType === 'video').length,
      totalSizeBytes: remainingItems.reduce((acc, c) => acc + (c.size || 0), 0),
    };

    setScanSummary(updatedSummary);
    SessionStore.saveScanCache(updatedSummary);

    // Filter decisions
    setDecisions(prev => {
      const next = { ...prev };
      for (const item of scanSummary.items) {
        if (deletedSet.has(item.uri)) {
          delete next[item.id];
        }
      }
      return next;
    });
  };

  const handleResetSession = async () => {
    await SessionStore.clearSession();
    setDecisions({});
    setCurrentIndex(0);
    setCanUndo(false);
    Alert.alert('Session Reset', 'All review progress has been reset to the beginning.');
  };

  const handleUpdateSettings = async (newSettings: Partial<UserSettings>) => {
    const updated = await SettingsStore.saveSettings(newSettings);
    setSettings(updated);
  };

  const allItems = scanSummary?.items || [];
  const filteredItems = allItems.filter(item => {
    if (item.mediaType === 'image' && !settings.includeImagesInReview) return false;
    if (item.mediaType === 'video' && !settings.includeVideosInReview) return false;
    return true;
  });

  const deleteCount = Object.values(decisions).filter(d => d.decision === 'DELETE').length;

  const isMainTab =
    currentScreen === 'home' ||
    currentScreen === 'clean' ||
    currentScreen === 'storage' ||
    currentScreen === 'settings';

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" />

      <View style={styles.screenContainer}>
        {currentScreen === 'home' && (
          <HomeScreen
            scanSummary={scanSummary}
            decisions={decisions}
            isScanning={isScanning}
            onScan={triggerScan}
            onPickFolder={handlePickFolder}
          />
        )}

        {currentScreen === 'clean' && (
          <CleanScreen
            items={filteredItems}
            decisions={decisions}
            currentIndex={currentIndex}
            canUndo={canUndo}
            hapticEnabled={settings.hapticFeedbackEnabled}
            onDecision={handleDecision}
            onUndo={handleUndo}
            onSkip={handleSkip}
            onScan={triggerScan}
          />
        )}

        {currentScreen === 'storage' && (
          <StorageScreen
            scanSummary={scanSummary}
            decisions={decisions}
            onDecision={handleDecision}
          />
        )}

        {currentScreen === 'settings' && (
          <SettingsScreen
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onRescan={triggerScan}
            onPickFolder={handlePickFolder}
            onResetSession={handleResetSession}
          />
        )}

        {currentScreen === 'queue' && (
          <QueueScreen
            items={allItems}
            decisions={decisions}
            onPostDelete={handlePostDelete}
          />
        )}

        {currentScreen === 'update' && (
          <UpdateScreen
            initialManifestUrl={settings.releaseManifestUrl}
            onUpdateManifestUrl={url => handleUpdateSettings({ releaseManifestUrl: url })}
          />
        )}

        {currentScreen === 'privacy' && <PrivacyScreen />}
      </View>

      {isMainTab && <BottomTabBar queueCount={deleteCount} />}
    </SafeAreaView>
  );
};

export const AppContainer: React.FC = () => {
  return (
    <NavigationProvider>
      <MainNavigator />
    </NavigationProvider>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  screenContainer: {
    flex: 1,
  },
});
