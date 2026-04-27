import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../src/components/ui/Button';
import { useAppStore } from '../../src/stores/appStore';
import { colors, typography, spacing, radius } from '../../src/theme';

type Pref = {
  key: keyof typeof DEFAULT_PREFS;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  desc: string;
  color: string;
};

const DEFAULT_PREFS = {
  voiceCommandsEnabled: true,
  autoTemplate: true,
  isErrorCheck: true,
  isReportGuideline: true,
  actionMode: false,
};

const PREFS: Pref[] = [
  {
    key: 'voiceCommandsEnabled',
    icon: 'mic-outline',
    title: 'Voice Commands',
    desc: 'Use voice to navigate and control the app hands-free.',
    color: colors.primaryLight,
  },
  {
    key: 'autoTemplate',
    icon: 'document-text-outline',
    title: 'Auto-select Template',
    desc: 'AI picks the best template for your transcribed findings.',
    color: colors.successLight,
  },
  {
    key: 'isErrorCheck',
    icon: 'shield-checkmark-outline',
    title: 'Error Checking',
    desc: 'Highlight potential clinical errors before signing off.',
    color: colors.warningLight,
  },
  {
    key: 'isReportGuideline',
    icon: 'book-outline',
    title: 'Report Guidelines',
    desc: 'Apply ACR/RCR reporting standards automatically.',
    color: colors.primaryLight,
  },
  {
    key: 'actionMode',
    icon: 'flash-outline',
    title: 'Action Mode',
    desc: 'Generate structured action lists from your findings.',
    color: colors.warningLight,
  },
];

export default function PreferencesScreen() {
  const [prefs, setPrefs] = useState(DEFAULT_PREFS);
  const updateUser = useAppStore((s) => s.updateUser);

  function toggle(key: keyof typeof DEFAULT_PREFS) {
    setPrefs((p) => ({ ...p, [key]: !p[key] }));
  }

  function handleNext() {
    updateUser({ settings: { ...prefs, defaultTranscriptionModel: 'voxtral' } });
    router.push('/(onboarding)/complete');
  }

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#060A14', '#0A1428', '#060A14']} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Ionicons name="arrow-back" size={22} color={colors.textSecondary} />
        </TouchableOpacity>
        <View style={styles.progress}>
          {[0, 1, 2, 3].map((i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === 2 && styles.dotActive,
                i < 2 && styles.dotDone,
              ]}
            />
          ))}
        </View>
        <View style={{ width: 22 }} />
      </View>

      <View style={styles.titleArea}>
        <Text style={styles.step}>Step 2 of 3</Text>
        <Text style={styles.title}>Your Preferences</Text>
        <Text style={styles.subtitle}>
          Customise FlowradAI to match your workflow. You can change these anytime.
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {PREFS.map((pref) => (
          <View key={pref.key} style={styles.row}>
            <View style={[styles.icon, { backgroundColor: pref.color + '20' }]}>
              <Ionicons name={pref.icon} size={20} color={pref.color} />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>{pref.title}</Text>
              <Text style={styles.rowDesc}>{pref.desc}</Text>
            </View>
            <Switch
              value={prefs[pref.key]}
              onValueChange={() => toggle(pref.key)}
              trackColor={{ false: colors.surfaceHover, true: colors.primary + '80' }}
              thumbColor={prefs[pref.key] ? colors.primaryLight : colors.textMuted}
            />
          </View>
        ))}

        {/* Transcription model */}
        <View style={styles.modelSection}>
          <Text style={styles.modelLabel}>Default Transcription Engine</Text>
          <View style={styles.modelRow}>
            {(['Voxtral', 'Groq', 'Gemini'] as const).map((m) => (
              <TouchableOpacity key={m} style={[styles.modelChip, m === 'Voxtral' && styles.modelChipActive]}>
                <Text style={[styles.modelChipText, m === 'Voxtral' && styles.modelChipTextActive]}>
                  {m}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button label="Continue →" onPress={handleNext} fullWidth size="lg" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing[16],
    paddingHorizontal: spacing[6],
    paddingBottom: spacing[4],
  },
  back: { padding: 2 },
  progress: { flexDirection: 'row', gap: spacing[2] },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.borderLight },
  dotActive: { width: 24, backgroundColor: colors.primary },
  dotDone: { backgroundColor: colors.success },
  titleArea: { paddingHorizontal: spacing[6], marginBottom: spacing[5] },
  step: { fontSize: typography.sm, color: colors.primaryLight, fontWeight: typography.medium, marginBottom: spacing[2] },
  title: { fontSize: typography['2xl'], fontWeight: typography.bold, color: colors.text, marginBottom: spacing[2] },
  subtitle: { fontSize: typography.sm, color: colors.textSecondary, lineHeight: typography.sm * 1.6 },
  list: { paddingHorizontal: spacing[6], gap: spacing[3], paddingBottom: spacing[4] },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing[4],
  },
  icon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  rowText: { flex: 1 },
  rowTitle: { fontSize: typography.base, fontWeight: typography.semibold, color: colors.text, marginBottom: 2 },
  rowDesc: { fontSize: typography.xs, color: colors.textSecondary, lineHeight: typography.xs * 1.5 },
  modelSection: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing[4],
    gap: spacing[3],
  },
  modelLabel: { fontSize: typography.sm, fontWeight: typography.medium, color: colors.textSecondary },
  modelRow: { flexDirection: 'row', gap: spacing[2] },
  modelChip: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: radius.full,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modelChipActive: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  modelChipText: { fontSize: typography.sm, color: colors.textMuted },
  modelChipTextActive: { color: colors.primaryLight, fontWeight: typography.semibold },
  footer: { padding: spacing[6], paddingBottom: spacing[10], backgroundColor: colors.bg },
});
