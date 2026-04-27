import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../src/components/ui/Button';
import { useAppStore, MOCK_SPECIALITIES } from '../../src/stores/appStore';
import { colors, typography, spacing, radius } from '../../src/theme';

export default function SpecialityScreen() {
  const [selected, setSelected] = useState<string | null>(null);
  const updateUser = useAppStore((s) => s.updateUser);

  function handleNext() {
    if (!selected) return;
    const spec = MOCK_SPECIALITIES.find((s) => s.id === selected);
    updateUser({ specialityId: selected, specialityName: spec?.name ?? '' });
    router.push('/(onboarding)/preferences');
  }

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#060A14', '#0A1428', '#060A14']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Ionicons name="arrow-back" size={22} color={colors.textSecondary} />
        </TouchableOpacity>
        <View style={styles.progress}>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={[styles.dot, i === 1 && styles.dotActive, i === 0 && styles.dotDone]} />
          ))}
        </View>
        <View style={{ width: 22 }} />
      </View>

      <View style={styles.titleArea}>
        <Text style={styles.step}>Step 1 of 3</Text>
        <Text style={styles.title}>Your Speciality</Text>
        <Text style={styles.subtitle}>
          We'll personalise templates and AI settings to match your practice area.
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
      >
        {MOCK_SPECIALITIES.map((spec) => {
          const isSelected = selected === spec.id;
          return (
            <TouchableOpacity
              key={spec.id}
              style={[styles.tile, isSelected && styles.tileSelected]}
              onPress={() => setSelected(spec.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.tileEmoji}>{spec.icon}</Text>
              <Text style={[styles.tileName, isSelected && styles.tileNameSelected]}>
                {spec.name}
              </Text>
              {isSelected && (
                <View style={styles.tileCheck}>
                  <Ionicons name="checkmark" size={12} color={colors.white} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label="Continue →"
          onPress={handleNext}
          disabled={!selected}
          fullWidth
          size="lg"
        />
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing[5],
    gap: spacing[3],
    paddingBottom: spacing[4],
  },
  tile: {
    width: '46%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing[4],
    alignItems: 'center',
    gap: spacing[2],
    position: 'relative',
  },
  tileSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  tileEmoji: { fontSize: 30 },
  tileName: {
    fontSize: typography.sm,
    fontWeight: typography.medium,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  tileNameSelected: { color: colors.primaryLight },
  tileCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    padding: spacing[6],
    paddingBottom: spacing[10],
    backgroundColor: colors.bg,
  },
});
