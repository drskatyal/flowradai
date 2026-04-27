import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius } from '../theme';

type Stat = {
  label: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
  color?: string;
};

type Props = { stats: Stat[] };

export function StatsRow({ stats }: Props) {
  return (
    <View style={styles.row}>
      {stats.map((s, i) => (
        <View key={i} style={styles.item}>
          <View style={[styles.iconBg, { backgroundColor: (s.color ?? colors.primary) + '20' }]}>
            <Ionicons name={s.icon} size={18} color={s.color ?? colors.primaryLight} />
          </View>
          <Text style={styles.value}>{s.value}</Text>
          <Text style={styles.label}>{s.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  item: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing[3],
    alignItems: 'center',
    gap: spacing[1],
  },
  iconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  value: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    color: colors.text,
  },
  label: {
    fontSize: typography.xs,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
