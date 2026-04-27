import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card } from '../../src/components/ui/Card';
import { useAppStore } from '../../src/stores/appStore';
import { colors, typography, spacing, radius } from '../../src/theme';

type SettingRow = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  toggle?: boolean;
  toggleKey?: keyof ReturnType<typeof useAppStore.getState>['user']['settings'];
  onPress?: () => void;
  color?: string;
  danger?: boolean;
};

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const user = useAppStore((s) => s.user);
  const updateUser = useAppStore((s) => s.updateUser);
  const clearAuth = useAppStore((s) => s.clearAuth);

  const settings = user?.settings;

  function toggleSetting(key: string) {
    if (!settings) return;
    updateUser({ settings: { ...settings, [key]: !settings[key as keyof typeof settings] } });
  }

  function handleSignOut() {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => {
          clearAuth();
          router.replace('/(auth)/sign-in');
        },
      },
    ]);
  }

  const ACCOUNT_ROWS: SettingRow[] = [
    { icon: 'person-outline', label: 'Full Name', value: `${user?.firstName} ${user?.lastName}` },
    { icon: 'mail-outline', label: 'Email', value: user?.email },
    { icon: 'medical-outline', label: 'Speciality', value: user?.specialityName },
    { icon: 'flash-outline', label: 'Available Credits', value: `${user?.availableCredits} reports`, color: colors.warningLight },
  ];

  const AI_ROWS = [
    { icon: 'mic-outline' as const, label: 'Voice Commands', toggleKey: 'voiceCommandsEnabled' as const },
    { icon: 'document-text-outline' as const, label: 'Auto-select Template', toggleKey: 'autoTemplate' as const },
    { icon: 'shield-checkmark-outline' as const, label: 'Error Checking', toggleKey: 'isErrorCheck' as const },
    { icon: 'book-outline' as const, label: 'Report Guidelines', toggleKey: 'isReportGuideline' as const },
    { icon: 'flash-outline' as const, label: 'Action Mode', toggleKey: 'actionMode' as const },
  ];

  const MODEL_DISPLAY: Record<string, string> = {
    voxtral: 'Voxtral',
    groq: 'Groq',
    gemini: 'Gemini',
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile & Settings</Text>
        </View>

        {/* Avatar card */}
        <View style={styles.avatarCard}>
          <LinearGradient
            colors={[colors.primarySoft, colors.surfaceAlt]}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarLetter}>{user?.firstName?.[0] ?? 'D'}</Text>
          </View>
          <View style={styles.avatarInfo}>
            <Text style={styles.avatarName}>{user?.firstName} {user?.lastName}</Text>
            <Text style={styles.avatarSpec}>{user?.specialityName}</Text>
            <View style={styles.planBadge}>
              <Ionicons name="flash" size={12} color={colors.warningLight} />
              <Text style={styles.planText}>
                {(user?.availableCredits ?? 0) > 100 ? 'Unlimited Plan' : `${user?.availableCredits} credits left`}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.editBtn}>
            <Ionicons name="pencil-outline" size={16} color={colors.primaryLight} />
          </TouchableOpacity>
        </View>

        {/* Account */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Account</Text>
          <Card style={styles.card}>
            {ACCOUNT_ROWS.map((row, i) => (
              <View key={i} style={[styles.row, i < ACCOUNT_ROWS.length - 1 && styles.rowBorder]}>
                <View style={styles.rowIcon}>
                  <Ionicons name={row.icon} size={18} color={row.color ?? colors.textMuted} />
                </View>
                <Text style={styles.rowLabel}>{row.label}</Text>
                <Text style={[styles.rowValue, row.color && { color: row.color }]}>{row.value}</Text>
              </View>
            ))}
          </Card>
        </View>

        {/* AI Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>AI Settings</Text>
          <Card style={styles.card}>
            {AI_ROWS.map((row, i) => (
              <View key={i} style={[styles.row, i < AI_ROWS.length - 1 && styles.rowBorder]}>
                <View style={styles.rowIcon}>
                  <Ionicons name={row.icon} size={18} color={colors.textMuted} />
                </View>
                <Text style={styles.rowLabel}>{row.label}</Text>
                <Switch
                  value={!!settings?.[row.toggleKey]}
                  onValueChange={() => toggleSetting(row.toggleKey)}
                  trackColor={{ false: colors.surfaceHover, true: colors.primary + '80' }}
                  thumbColor={settings?.[row.toggleKey] ? colors.primaryLight : colors.textMuted}
                />
              </View>
            ))}
            <View style={[styles.row, styles.rowBorder]}>
              <View style={styles.rowIcon}>
                <Ionicons name="radio-outline" size={18} color={colors.textMuted} />
              </View>
              <Text style={styles.rowLabel}>Transcription Engine</Text>
              <Text style={styles.rowValue}>
                {MODEL_DISPLAY[settings?.defaultTranscriptionModel ?? 'voxtral']}
              </Text>
            </View>
          </Card>
        </View>

        {/* Subscription */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Subscription</Text>
          <Card style={styles.subCard}>
            <LinearGradient
              colors={['#1E1A0A', '#1A2214']}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <View style={styles.subRow}>
              <View>
                <Text style={styles.subPlan}>Standard Plan</Text>
                <Text style={styles.subDetail}>200 reports · Valid until Dec 2025</Text>
              </View>
              <View style={styles.subBadge}>
                <Text style={styles.subBadgeText}>ACTIVE</Text>
              </View>
            </View>
            <View style={styles.creditBar}>
              <View style={[styles.creditFill, { width: `${((user?.availableCredits ?? 0) / (user?.totalCredits ?? 200)) * 100}%` }]} />
            </View>
            <Text style={styles.creditLabel}>
              {user?.availableCredits}/{user?.totalCredits} reports remaining
            </Text>
            <TouchableOpacity style={styles.upgradeBtn}>
              <Ionicons name="flash" size={15} color={colors.white} />
              <Text style={styles.upgradeBtnText}>Upgrade to Unlimited</Text>
            </TouchableOpacity>
          </Card>
        </View>

        {/* App */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>App</Text>
          <Card style={styles.card}>
            {[
              { icon: 'share-outline' as const, label: 'Refer a Colleague' },
              { icon: 'help-circle-outline' as const, label: 'Help & Support' },
              { icon: 'document-text-outline' as const, label: 'Privacy Policy' },
              { icon: 'information-circle-outline' as const, label: 'About FlowradAI', value: 'v1.0.0' },
            ].map((row, i) => (
              <TouchableOpacity key={i} style={[styles.row, i < 3 && styles.rowBorder]} activeOpacity={0.7}>
                <View style={styles.rowIcon}>
                  <Ionicons name={row.icon} size={18} color={colors.textMuted} />
                </View>
                <Text style={styles.rowLabel}>{row.label}</Text>
                <View style={styles.rowRight}>
                  {row.value && <Text style={styles.rowValue}>{row.value}</Text>}
                  <Ionicons name="chevron-forward" size={16} color={colors.textDisabled} />
                </View>
              </TouchableOpacity>
            ))}
          </Card>
        </View>

        {/* Sign out */}
        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={18} color={colors.errorLight} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>FlowradAI Mobile v1.0.0 — © 2025 FlowradAI Technologies</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingHorizontal: spacing[5], paddingBottom: spacing[20] },
  header: { paddingVertical: spacing[4] },
  title: { fontSize: typography['2xl'], fontWeight: typography.bold, color: colors.text },

  // Avatar card
  avatarCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing[5],
    marginBottom: spacing[6],
    overflow: 'hidden',
    position: 'relative',
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarLetter: { fontSize: typography.xl, fontWeight: typography.bold, color: colors.white },
  avatarInfo: { flex: 1, gap: 3 },
  avatarName: { fontSize: typography.md, fontWeight: typography.bold, color: colors.text },
  avatarSpec: { fontSize: typography.sm, color: colors.textSecondary },
  planBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  planText: { fontSize: typography.xs, color: colors.warningLight, fontWeight: typography.medium },
  editBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Sections
  section: { marginBottom: spacing[5] },
  sectionLabel: {
    fontSize: typography.xs,
    color: colors.textMuted,
    fontWeight: typography.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing[3],
    marginLeft: spacing[1],
  },
  card: { padding: 0, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  rowLabel: { flex: 1, fontSize: typography.base, color: colors.text },
  rowValue: { fontSize: typography.sm, color: colors.textMuted },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },

  // Subscription
  subCard: {
    padding: spacing[5],
    gap: spacing[3],
    overflow: 'hidden',
    position: 'relative',
    borderRadius: radius.xl,
  },
  subRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  subPlan: { fontSize: typography.md, fontWeight: typography.bold, color: colors.text },
  subDetail: { fontSize: typography.sm, color: colors.textSecondary, marginTop: 2 },
  subBadge: {
    backgroundColor: colors.successSoft,
    borderRadius: radius.full,
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: colors.success + '40',
  },
  subBadgeText: { fontSize: 10, fontWeight: typography.bold, color: colors.successLight, letterSpacing: 1 },
  creditBar: {
    height: 6,
    backgroundColor: colors.surfaceHover,
    borderRadius: 3,
    overflow: 'hidden',
  },
  creditFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 3 },
  creditLabel: { fontSize: typography.xs, color: colors.textMuted },
  upgradeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing[3],
    marginTop: spacing[2],
  },
  upgradeBtnText: { fontSize: typography.sm, fontWeight: typography.semibold, color: colors.white },

  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    backgroundColor: colors.errorSoft,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.error + '30',
    padding: spacing[4],
    marginBottom: spacing[4],
  },
  signOutText: { fontSize: typography.base, fontWeight: typography.semibold, color: colors.errorLight },
  version: { fontSize: typography.xs, color: colors.textDisabled, textAlign: 'center', marginBottom: spacing[4] },
});
