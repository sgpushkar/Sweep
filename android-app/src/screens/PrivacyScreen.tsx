import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { theme } from '../theme/theme';
import { Header } from '../components/common/Header';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { useAppNavigation } from '../navigation/NavigationContext';

export const PrivacyScreen: React.FC = () => {
  const { goBack } = useAppNavigation();

  return (
    <View style={styles.container}>
      <Header
        title="Privacy & Data Model"
        subtitle="Zero cloud processing"
        onBack={() => goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Highlight Card */}
        <Card style={styles.heroCard}>
          <Badge label="OFFLINE-FIRST UTILITY" variant="accent" size="sm" />
          <Text style={styles.heroTitle}>Your Personal Media Stays on Your Device</Text>
          <Text style={styles.heroBody}>
            WhatsApp Media Cleaner operates 100% locally on your Android device. It requires no
            user account, no cloud servers, and does not upload or analyze photos or videos remotely.
          </Text>
        </Card>

        {/* Section 1: Permissions */}
        <Text style={styles.sectionHeader}>PERMISSIONS & ACCESS</Text>
        <Card style={styles.card}>
          <Text style={styles.pointTitle}>1. Android MediaStore Access</Text>
          <Text style={styles.pointBody}>
            The app requests standard visual media read permissions (`READ_MEDIA_IMAGES` and
            `READ_MEDIA_VIDEO` on Android 13+, and legacy storage permissions on older OS versions)
            solely to discover accessible WhatsApp photos and videos.
          </Text>

          <View style={styles.divider} />

          <Text style={styles.pointTitle}>2. Partial Access Support</Text>
          <Text style={styles.pointBody}>
            On Android 14+, if you grant partial access (`READ_MEDIA_VISUAL_USER_SELECTED`), the app
            indexes only the selected media without requesting unrestricted access.
          </Text>

          <View style={styles.divider} />

          <Text style={styles.pointTitle}>3. Storage Access Framework (SAF)</Text>
          <Text style={styles.pointBody}>
            If you choose to select a custom folder, access is granted strictly through Android's
            system document tree picker.
          </Text>
        </Card>

        {/* Section 2: Deletion Safety */}
        <Text style={styles.sectionHeader}>SAFE DELETION MODEL</Text>
        <Card style={styles.card}>
          <Text style={styles.pointTitle}>No Destructive Swipes</Text>
          <Text style={styles.pointBody}>
            Swiping left only marks an item for deletion in your local queue. No files are removed
            until you review the deletion candidates and confirm.
          </Text>

          <View style={styles.divider} />

          <Text style={styles.pointTitle}>Android System Confirmation</Text>
          <Text style={styles.pointBody}>
            On Android 11 and later, physical deletion is authorized through Android's official
            `MediaStore.createDeleteRequest()` system dialog. The OS itself asks for your permission
            before any file is deleted.
          </Text>
        </Card>

        {/* Section 3: Network & APK Updates */}
        <Text style={styles.sectionHeader}>NETWORK & UPDATES</Text>
        <Card style={styles.card}>
          <Text style={styles.pointTitle}>In-App APK Releases</Text>
          <Text style={styles.pointBody}>
            Network requests occur strictly when you manually check for APK updates or download a
            release from the configured HTTPS manifest URL. All downloaded APKs are verified using
            cryptographic SHA-256 checksums before installation.
          </Text>
        </Card>
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
  heroCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
  },
  heroTitle: {
    ...theme.typography.h2,
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  heroBody: {
    ...theme.typography.bodySecondary,
    lineHeight: 22,
  },
  sectionHeader: {
    ...theme.typography.label,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  card: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  pointTitle: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  pointBody: {
    ...theme.typography.bodySecondary,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.borderSubtle,
    marginVertical: theme.spacing.md,
  },
});
