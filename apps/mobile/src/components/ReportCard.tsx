import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Report } from '../stores/appStore';
import { colors, typography, spacing, radius } from '../theme';

type Props = {
  report: Report;
  onPress: () => void;
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function ReportCard({ report, onPress }: Props) {
  const isAbnormal = report.category === 'abnormal';

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Card style={styles.card}>
        <View style={styles.topRow}>
          <View style={[styles.dot, isAbnormal ? styles.dotAbnormal : styles.dotNormal]} />
          <Text style={styles.title} numberOfLines={1}>
            {report.title}
          </Text>
          <Text style={styles.time}>{timeAgo(report.createdAt)}</Text>
        </View>

        {report.templateTitle && (
          <Text style={styles.template} numberOfLines={1}>
            <Ionicons name="document-text-outline" size={11} color={colors.textMuted} /> {report.templateTitle}
          </Text>
        )}

        <Text style={styles.preview} numberOfLines={2}>
          {report.content}
        </Text>

        <View style={styles.footer}>
          <Badge label={isAbnormal ? 'Abnormal' : 'Normal'} variant={isAbnormal ? 'abnormal' : 'normal'} />
          <View style={styles.modelTag}>
            <Ionicons name="flash-outline" size={11} color={colors.textMuted} />
            <Text style={styles.modelText}>{report.model}</Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing[3] },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[2],
    gap: spacing[2],
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotNormal: { backgroundColor: colors.successLight },
  dotAbnormal: { backgroundColor: colors.warningLight },
  title: {
    flex: 1,
    fontSize: typography.base,
    fontWeight: typography.semibold,
    color: colors.text,
  },
  time: {
    fontSize: typography.xs,
    color: colors.textMuted,
  },
  template: {
    fontSize: typography.xs,
    color: colors.textMuted,
    marginBottom: spacing[2],
  },
  preview: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    lineHeight: typography.sm * 1.6,
    marginBottom: spacing[3],
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modelTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  modelText: {
    fontSize: typography.xs,
    color: colors.textMuted,
  },
});
