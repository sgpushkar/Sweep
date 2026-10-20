import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { theme } from '../theme/theme';
import { Header } from '../components/common/Header';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { UserSettings, SwipeSensitivity } from '../types/settings';
import { WhatsAppCleanerNativeBridge } from '../native/WhatsAppCleanerNative';
import { useAppNavigation } from '../navigation/NavigationContext';

interface SettingsScreenProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  onRescan: () => void;
  onPickFolder: () => void;
  onResetSession: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  onUpdateSettings,
  onRescan,
  onPickFolder,
  onResetSession,
}) => {
  const { navigateTo } = useAppNavigation();

  const handleOpenAppSettings = async () => {
    await WhatsAppCleanerNativeBridge.openAppSettings();
  };

  const handleConfirmReset = () => {
    Alert.alert(
      'Reset All Review Progress',
      'This will erase all recorded KEEP, DELETE, and SKIP decisions and restore the review queue to the beginning. No files will be modified.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Progress',
          style: 'destructive',
          onPress: onResetSession,
        },
      ]
    );
  };

  const sensitivities: SwipeSensitivity[] = ['low', 'normal', 'high'];

  return (
    <View style={styles.container}>
      <Header title="Settings" subtitle="Preferences & Configuration" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Gestures & Haptics */}
        <Text style={styles.sectionHeader}>INTERACTION & GESTURES</Text>
        <Card style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.labelCol}>
              <Text style={styles.settingTitle}>Haptic Feedback</Text>
              <Text style={styles.settingDesc}>
                Vibrate on swipe decisions and button taps
              </Text>
            </View>
            <Switch
              value={settings.hapticFeedbackEnabled}
              onValueChange={val => onUpdateSettings({ hapticFeedbackEnabled: val })}
              trackColor={{ false: theme.colors.surfaceHighlight, true: theme.colors.accentDark }}
              thumbColor={settings.hapticFeedbackEnabled ? theme.colors.accent : '#888'}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingCol}>
            <Text style={styles.settingTitle}>Swipe Sensitivity</Text>
            <Text style={styles.settingDesc}>
              Distance threshold required to trigger Keep or Delete
            </Text>
            <View style={styles.pillRow}>
              {sensitivities.map(s => (
                <TouchableOpacity
                  key={s}
                  style={[
                    styles.pillButton,
                    settings.swipeSensitivity === s && styles.pillButtonActive,
                  ]}
                  onPress={() => onUpdateSettings({ swipeSensitivity: s })}
                >
                  <Text
                    style={[
                      styles.pillButtonText,
                      settings.swipeSensitivity === s && styles.pillButtonTextActive,
                    ]}
                  >
                    {s.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Card>

        {/* Media Review Scope */}
        <Text style={styles.sectionHeader}>REVIEW SCOPE</Text>
        <Card style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.labelCol}>
              <Text style={styles.settingTitle}>Include Images</Text>
              <Text style={styles.settingDesc}>WhatsApp Photos and received images</Text>
            </View>
            <Switch
              value={settings.includeImagesInReview}
              onValueChange={val => onUpdateSettings({ includeImagesInReview: val })}
              trackColor={{ false: theme.colors.surfaceHighlight, true: theme.colors.accentDark }}
              thumbColor={settings.includeImagesInReview ? theme.colors.accent : '#888'}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.labelCol}>
              <Text style={styles.settingTitle}>Include Videos</Text>
              <Text style={styles.settingDesc}>WhatsApp Videos and animations</Text>
            </View>
            <Switch
              value={settings.includeVideosInReview}
              onValueChange={val => onUpdateSettings({ includeVideosInReview: val })}
              trackColor={{ false: theme.colors.surfaceHighlight, true: theme.colors.accentDark }}
              thumbColor={settings.includeVideosInReview ? theme.colors.accent : '#888'}
            />
          </View>
        </Card>

        {/* Media Storage & Permissions */}
        <Text style={styles.sectionHeader}>STORAGE & DISCOVERY</Text>
        <Card style={styles.card}>
          <TouchableOpacity style={styles.actionRow} onPress={onRescan}>
            <View>
              <Text style={styles.settingTitle}>Rescan MediaStore</Text>
              <Text style={styles.settingDesc}>Refresh indexed files from Android</Text>
            </View>
            <Text style={styles.arrowIcon}>🔄</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.actionRow} onPress={onPickFolder}>
            <View>
              <Text style={styles.settingTitle}>Select Custom WhatsApp Folder</Text>
              <Text style={styles.settingDesc}>Storage Access Framework fallback picker</Text>
            </View>
            <Text style={styles.arrowIcon}>📁</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.actionRow} onPress={handleOpenAppSettings}>
            <View>
              <Text style={styles.settingTitle}>Android System Permissions</Text>
              <Text style={styles.settingDesc}>Open app settings to adjust permissions</Text>
            </View>
            <Text style={styles.arrowIcon}>⚙️</Text>
          </TouchableOpacity>
        </Card>

        {/* Updates & App Info */}
        <Text style={styles.sectionHeader}>UPDATES & PRIVACY</Text>
        <Card style={styles.card}>
          <TouchableOpacity style={styles.actionRow} onPress={() => navigateTo('update')}>
            <View>
              <Text style={styles.settingTitle}>Check for APK Releases</Text>
              <Text style={styles.settingDesc}>In-app APK download & verification</Text>
            </View>
            <Badge label="v1.0.0" variant="accent" size="sm" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.actionRow} onPress={() => navigateTo('privacy')}>
            <View>
              <Text style={styles.settingTitle}>Privacy & Data Model</Text>
              <Text style={styles.settingDesc}>100% offline, no cloud processing</Text>
            </View>
            <Text style={styles.arrowIcon}>🛡️</Text>
          </TouchableOpacity>
        </Card>

        {/* Danger Zone: Reset */}
        <Text style={styles.sectionHeader}>RESET SESSION</Text>
        <Card style={[styles.card, styles.dangerCard]}>
          <TouchableOpacity style={styles.actionRow} onPress={handleConfirmReset}>
            <View>
              <Text style={styles.dangerTitle}>Reset Review History</Text>
              <Text style={styles.settingDesc}>Clear decisions and restart review queue</Text>
            </View>
            <Text style={styles.arrowIcon}>🗑️</Text>
          </TouchableOpacity>
        </Card>

        <Text style={styles.footerText}>
          WhatsApp Media Cleaner • Android Native Release
        </Text>
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
  sectionHeader: {
    ...theme.typography.label,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  card: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  settingCol: {
    paddingVertical: 4,
  },
  labelCol: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  settingTitle: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  settingDesc: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.borderSubtle,
    marginVertical: theme.spacing.md,
  },
  pillRow: {
    flexDirection: 'row',
    marginTop: theme.spacing.md,
  },
  pillButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radii.md,
    marginRight: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  pillButtonActive: {
    backgroundColor: theme.colors.accentDark,
    borderColor: theme.colors.accent,
  },
  pillButtonText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontWeight: '700',
  },
  pillButtonTextActive: {
    color: '#FFF',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  arrowIcon: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  dangerCard: {
    backgroundColor: '#18181b',
    borderColor: '#27272a',
  },
  dangerTitle: {
    ...theme.typography.body,
    fontWeight: '700',
    color: '#e4e4e7',
  },
  footerText: {
    ...theme.typography.caption,
    textAlign: 'center',
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xl,
  },
});
