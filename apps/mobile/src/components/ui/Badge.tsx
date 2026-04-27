import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme';

type Variant = 'normal' | 'abnormal' | 'public' | 'private' | 'default';

export function Badge({ label, variant = 'default' }: { label: string; variant?: Variant }) {
  return (
    <View style={[styles.base, styles[variant]]}>
      <Text style={[styles.text, styles[`text_${variant}`]]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: spacing[2],
    paddingVertical: 3,
    borderRadius: radius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  default: { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
  normal: { backgroundColor: colors.successSoft, borderColor: 'rgba(52,211,153,0.20)' },
  abnormal: { backgroundColor: colors.warningSoft, borderColor: 'rgba(251,191,36,0.20)' },
  public: { backgroundColor: colors.primarySoft, borderColor: 'rgba(96,165,250,0.20)' },
  private: { backgroundColor: colors.surfaceAlt, borderColor: colors.border },

  text: { fontSize: typography.xs, fontWeight: typography.semibold, letterSpacing: 0.3 },
  text_default: { color: colors.textSecondary },
  text_normal: { color: colors.successLight },
  text_abnormal: { color: colors.warningLight },
  text_public: { color: colors.primaryLight },
  text_private: { color: colors.textMuted },
});
