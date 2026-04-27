import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../src/components/ui/Button';
import { useAppStore } from '../../src/stores/appStore';
import { colors, typography, spacing, radius } from '../../src/theme';

const STEPS = [
  { icon: 'person-circle-outline' as const, label: 'Profile created' },
  { icon: 'medical-outline' as const, label: 'Speciality configured' },
  { icon: 'settings-outline' as const, label: 'Preferences saved' },
  { icon: 'cloud-done-outline' as const, label: 'Templates synced' },
];

export default function CompleteScreen() {
  const setOnboardingComplete = useAppStore((s) => s.setOnboardingComplete);
  const user = useAppStore((s) => s.user);
  const scale = useRef(new Animated.Value(0.5)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const stepAnims = useRef(STEPS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, friction: 6, tension: 100, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();

    STEPS.forEach((_, i) => {
      Animated.timing(stepAnims[i], {
        toValue: 1,
        duration: 350,
        delay: 400 + i * 150,
        useNativeDriver: true,
      }).start();
    });
  }, []);

  function handleStart() {
    setOnboardingComplete();
    router.replace('/(app)');
  }

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#060A14', '#071428', '#060A14']} style={StyleSheet.absoluteFill} />

      <View style={styles.content}>
        {/* Success icon */}
        <Animated.View style={[styles.successIcon, { transform: [{ scale }], opacity }]}>
          <LinearGradient
            colors={[colors.success + 'CC', colors.successLight + 'CC']}
            style={styles.successGradient}
          >
            <Ionicons name="checkmark-circle" size={64} color={colors.white} />
          </LinearGradient>
        </Animated.View>

        <Animated.View style={{ opacity }}>
          <Text style={styles.heading}>You're all set,{'\n'}
            <Text style={styles.name}>
              {user?.firstName ?? 'Doctor'} 👋
            </Text>
          </Text>
          <Text style={styles.subtitle}>
            Your FlowradAI workspace is ready. Start dictating your first report.
          </Text>
        </Animated.View>

        {/* Step checklist */}
        <View style={styles.checklist}>
          {STEPS.map((step, i) => (
            <Animated.View
              key={i}
              style={[
                styles.checkRow,
                {
                  opacity: stepAnims[i],
                  transform: [
                    {
                      translateX: stepAnims[i].interpolate({
                        inputRange: [0, 1],
                        outputRange: [-20, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <View style={styles.checkIcon}>
                <Ionicons name={step.icon} size={18} color={colors.successLight} />
              </View>
              <Text style={styles.checkLabel}>{step.label}</Text>
              <Ionicons name="checkmark-circle" size={18} color={colors.success} />
            </Animated.View>
          ))}
        </View>

        {/* Credits badge */}
        <View style={styles.creditsBadge}>
          <Ionicons name="flash" size={20} color={colors.warningLight} />
          <Text style={styles.creditsText}>
            <Text style={styles.creditsNum}>50 free reports</Text> included with your account
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Button label="Start Reporting →" onPress={handleStart} fullWidth size="lg" />
        <Text style={styles.footerNote}>
          Dictate, transcribe, refine — all in one place
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1, paddingHorizontal: spacing[6], justifyContent: 'center', gap: spacing[6] },
  successIcon: {
    alignSelf: 'center',
    marginBottom: spacing[2],
  },
  successGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    fontSize: typography['2xl'],
    fontWeight: typography.bold,
    color: colors.text,
    textAlign: 'center',
    lineHeight: typography['2xl'] * 1.3,
  },
  name: { color: colors.primaryLight },
  subtitle: {
    fontSize: typography.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.base * 1.6,
    marginTop: spacing[2],
  },
  checklist: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing[4],
    gap: spacing[3],
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  checkIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.successSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkLabel: {
    flex: 1,
    fontSize: typography.base,
    color: colors.text,
    fontWeight: typography.medium,
  },
  creditsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    backgroundColor: colors.warningSoft,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.warning + '40',
    padding: spacing[4],
  },
  creditsText: { flex: 1, fontSize: typography.sm, color: colors.textSecondary },
  creditsNum: { color: colors.warningLight, fontWeight: typography.bold },
  footer: {
    padding: spacing[6],
    paddingBottom: spacing[10],
    gap: spacing[3],
  },
  footerNote: { fontSize: typography.xs, color: colors.textMuted, textAlign: 'center' },
});
