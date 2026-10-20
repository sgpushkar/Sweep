import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { theme } from '../theme/theme';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { MediaDiscoveryService } from '../services/mediaDiscovery';
import { MediaItem, ReviewDecisionMap, ScanSummary } from '../types/media';
import { useAppNavigation } from '../navigation/NavigationContext';

interface HomeScreenProps {
  scanSummary: ScanSummary | null;
  decisions: ReviewDecisionMap;
  isScanning: boolean;
  onScan: () => void;
  onPickFolder: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  scanSummary,
  decisions,
  isScanning,
  onScan,
  onPickFolder,
}) => {
  const { navigateTo, navigateTab } = useAppNavigation();

  const totalItems = scanSummary?.items || [];
  const reviewedCount = Object.keys(decisions).length;
  const deleteCount = Object.values(decisions).filter(d => d.decision === 'DELETE').length;

  const reclaimableBytes = totalItems
    .filter(i => decisions[i.id]?.decision === 'DELETE')
    .reduce((acc, curr) => acc + (curr.size || 0), 0);

  const hasPendingDeletions = deleteCount > 0;
  const permissionStatus = scanSummary?.permissionStatus || 'not_determined';
  const isPartial = scanSummary?.isPartialAccess;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={isScanning}
          onRefresh={onScan}
          tintColor={theme.colors.accent}
          colors={[theme.colors.accent]}
        />
      }
    >
      {/* Editorial Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>LOCAL UTILITY</Text>
          <Text style={styles.title}>WhatsApp Cleaner</Text>
        </View>

        <TouchableOpacity
          style={styles.badgeTouch}
          onPress={() => navigateTo('privacy')}
        >
          <Badge
            label={
              permissionStatus === 'denied'
                ? 'ACCESS DENIED'
                : isPartial
                ? 'PARTIAL ACCESS'
                : 'PRIVACY FIRST'
            }
            variant={
              permissionStatus === 'denied'
                ? 'danger'
                : isPartial
                ? 'warning'
                : 'accent'
            }
          />
        </TouchableOpacity>
      </View>

      {/* Main Storage Highlight Card */}
      <Card style={styles.heroCard}>
        <Text style={styles.heroLabel}>DISCOVERED WHATSAPP MEDIA</Text>
        {isScanning ? (
          <View style={styles.scanningBox}>
            <ActivityIndicator size="large" color={theme.colors.accent} />
            <Text style={styles.scanningText}>Querying Android MediaStore...</Text>
          </View>
        ) : (
          <>
            <Text style={styles.heroValue}>
              {MediaDiscoveryService.formatBytes(scanSummary?.totalSizeBytes || 0)}
            </Text>
            <View style={styles.heroStatsRow}>
              <View style={styles.miniStat}>
                <Text style={styles.miniStatNumber}>
                  {(scanSummary?.imageCount || 0).toLocaleString()}
                </Text>
                <Text style={styles.miniStatLabel}>Images</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.miniStat}>
                <Text style={styles.miniStatNumber}>
                  {(scanSummary?.videoCount || 0).toLocaleString()}
                </Text>
                <Text style={styles.miniStatLabel}>Videos</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.miniStat}>
                <Text style={styles.miniStatNumber}>
                  {reviewedCount.toLocaleString()}
                </Text>
                <Text style={styles.miniStatLabel}>Reviewed</Text>
              </View>
            </View>
          </>
        )}
      </Card>

      {/* Deletion Queue Alert Banner if candidates exist */}
      {hasPendingDeletions && (
        <TouchableOpacity
          onPress={() => navigateTo('queue')}
          activeOpacity={0.8}
        >
          <Card style={styles.queueAlertCard}>
            <View style={styles.queueAlertRow}>
              <View style={styles.queueAlertLeft}>
                <Text style={styles.queueAlertTitle}>
                  {deleteCount} {deleteCount === 1 ? 'item' : 'items'} marked for deletion
                </Text>
                <Text style={styles.queueAlertSubtitle}>
                  {MediaDiscoveryService.formatBytes(reclaimableBytes)} reclaimable
                </Text>
              </View>
              <View style={styles.queueAlertButton}>
                <Text style={styles.queueAlertButtonText}>Inspect →</Text>
              </View>
            </View>
          </Card>
        </TouchableOpacity>
      )}

      {/* Primary Action Button */}
      <View style={styles.primaryActionBox}>
        <Button
          label={
            totalItems.length === 0
              ? 'Scan Media Library'
              : reviewedCount < totalItems.length
              ? 'Start Cleaning'
              : 'Review Cleaned Media'
          }
          icon="🧹"
          onPress={() => {
            if (totalItems.length === 0) {
              onScan();
            } else {
              navigateTab('clean');
            }
          }}
          loading={isScanning}
          style={styles.mainButton}
        />
      </View>

      {/* Quick Navigation Cards */}
      <View style={styles.quickGrid}>
        <TouchableOpacity
          style={styles.gridCard}
          onPress={() => navigateTab('storage')}
          activeOpacity={0.8}
        >
          <Text style={styles.gridIcon}>📊</Text>
          <Text style={styles.gridTitle}>Storage Insights</Text>
          <Text style={styles.gridSubtitle}>Breakdown & sizes</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.gridCard}
          onPress={onScan}
          activeOpacity={0.8}
        >
          <Text style={styles.gridIcon}>🔄</Text>
          <Text style={styles.gridTitle}>Rescan Library</Text>
          <Text style={styles.gridSubtitle}>Refresh MediaStore</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.gridCard}
          onPress={onPickFolder}
          activeOpacity={0.8}
        >
          <Text style={styles.gridIcon}>📁</Text>
          <Text style={styles.gridTitle}>Pick Folder</Text>
          <Text style={styles.gridSubtitle}>SAF fallback mode</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.gridCard}
          onPress={() => navigateTo('update')}
          activeOpacity={0.8}
        >
          <Text style={styles.gridIcon}>⬇️</Text>
          <Text style={styles.gridTitle}>Check Release</Text>
          <Text style={styles.gridSubtitle}>In-app APK updates</Text>
        </TouchableOpacity>
      </View>

      {/* Last Scan Info */}
      {scanSummary?.scannedAt ? (
        <Text style={styles.lastScanText}>
          Last scanned {new Date(scanSummary.scannedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          {' • '}
          {scanSummary.totalCount} media items indexed
        </Text>
      ) : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.xl,
    paddingTop: theme.spacing.sm,
  },
  eyebrow: {
    ...theme.typography.label,
    color: theme.colors.textMuted,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.textPrimary,
    marginTop: 2,
  },
  badgeTouch: {
    marginTop: 4,
  },
  heroCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
  },
  heroLabel: {
    ...theme.typography.label,
    color: theme.colors.accent,
  },
  heroValue: {
    ...theme.typography.display,
    color: theme.colors.textPrimary,
    marginVertical: theme.spacing.sm,
  },
  scanningBox: {
    paddingVertical: theme.spacing.xl,
    alignItems: 'center',
  },
  scanningText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
  },
  heroStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderSubtle,
  },
  miniStat: {
    flex: 1,
    alignItems: 'center',
  },
  miniStatNumber: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
  },
  miniStatLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: theme.colors.borderSubtle,
  },
  queueAlertCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.md,
  },
  queueAlertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  queueAlertLeft: {
    flex: 1,
  },
  queueAlertTitle: {
    ...theme.typography.body,
    fontWeight: '700',
    color: theme.colors.dangerLight,
  },
  queueAlertSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  queueAlertButton: {
    backgroundColor: theme.colors.danger,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    borderRadius: theme.radii.full,
  },
  queueAlertButtonText: {
    ...theme.typography.caption,
    fontWeight: '700',
    color: '#FFF',
  },
  primaryActionBox: {
    marginBottom: theme.spacing.xl,
  },
  mainButton: {
    height: 56,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xl,
  },
  gridCard: {
    width: '48%',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  gridIcon: {
    fontSize: 24,
    marginBottom: theme.spacing.sm,
  },
  gridTitle: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  gridSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  lastScanText: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
});
