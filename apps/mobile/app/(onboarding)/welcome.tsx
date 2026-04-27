import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../src/components/ui/Button';
import { colors, typography, spacing, radius } from '../../src/theme';

const { width } = Dimensions.get('window');

const FEATURES = [
  { icon: 'mic-outline' as const, title: 'Voice Dictation', desc: 'Speak your findings — AI transcribes and structures your report instantly.' },
  { icon: 'document-text-outline' as const, title: 'Smart Templates', desc: '50+ radiology templates across all specialities. Normal and abnormal.' },
  { icon: 'flash-outline' as const, title: 'AI Refinement', desc: 'Auto-correct, grammar check, and clinical language enhancement.' },
  { icon: 'shield-checkmark-outline' as const, title: 'Report Validation', desc: 'Evidence-based guidelines applied automatically to every report.' },
];

export default function WelcomeScreen() {
  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#060A14', '#0A1428', '#060A14']}
        style={StyleSheet.absoluteFill}
      />

      {/* Progress */}
      <View style={styles.progress}>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={[styles.dot, i === 0 && styles.dotActive]} />
        ))}
      </View>

      {/* Hero */}
      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <Ionicons name="radio-outline" size={52} color={colors.primaryLight} />
          <View style={styles.heroBadge}>
            <Ionicons name="flash" size={12} color={colors.white} />
          </View>
        </View>
        <Text style={styles.title}>
          Radiology{'\n'}Reporting{'\n'}
          <Text style={styles.titleAccent}>Reimagined</Text>
        </Text>
        <Text style={styles.subtitle}>
          Generate structured, validated reports in seconds — not minutes.
        </Text>
      </View>

      {/* Features */}
      <View style={styles.features}>
        {FEATURES.map((f, i) => (
          <View key={i} style={styles.feature}>
            <View style={styles.featureIcon}>
              <Ionicons name={f.icon} size={20} color={colors.primaryLight} />
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>{f.title}</Text>
              <Text style={styles.featureDesc}>{f.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* CTA */}
      <View style={styles.cta}>
        <Button label="Get Started →" onPress={() => router.push('/(onboarding)/speciality')} fullWidth size="lg" />
        <Text style={styles.ctaNote}>Takes less than 2 minutes to set up</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: spacing[6] },
  progress: {
    flexDirection: 'row',
    gap: spacing[2],
    paddingTop: spacing[16],
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.borderLight,
  },
  dotActive: {
    width: 24,
    backgroundColor: colors.primary,
  },
  hero: { alignItems: 'center', paddingTop: spacing[8], paddingBottom: spacing[6] },
  heroIcon: {
    position: 'relative',
    width: 100,
    height: 100,
    borderRadius: 28,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primary + '50',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[5],
  },
  heroBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: typography['3xl'],
    fontWeight: typography.extrabold,
    color: colors.text,
    textAlign: 'center',
    lineHeight: typography['3xl'] * 1.2,
    marginBottom: spacing[3],
  },
  titleAccent: { color: colors.primaryLight },
  subtitle: {
    fontSize: typography.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.base * 1.6,
    paddingHorizontal: spacing[4],
  },
  features: { gap: spacing[3], marginBottom: spacing[6] },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing[4],
  },
  featureIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  featureText: { flex: 1 },
  featureTitle: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
    color: colors.text,
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    lineHeight: typography.sm * 1.5,
  },
  cta: { gap: spacing[3], paddingBottom: spacing[10] },
  ctaNote: { fontSize: typography.xs, color: colors.textMuted, textAlign: 'center' },
});
