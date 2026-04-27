import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Template } from '../stores/appStore';
import { colors, typography, spacing, radius } from '../theme';

type Props = {
  template: Template;
  onPress: () => void;
  selected?: boolean;
};

export function TemplateCard({ template, onPress, selected }: Props) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Card
        style={[styles.card, selected && styles.selected]}
        glow={selected ? colors.primaryGlow : undefined}
      >
        <View style={styles.row}>
          <View style={styles.content}>
            <Text style={styles.title} numberOfLines={1}>
              {template.title}
            </Text>
            <Text style={styles.desc} numberOfLines={2}>
              {template.description}
            </Text>
            <View style={styles.tags}>
              {template.category && (
                <Badge
                  label={template.category === 'normal' ? 'Normal' : 'Abnormal'}
                  variant={template.category === 'normal' ? 'normal' : 'abnormal'}
                />
              )}
              <Badge
                label={template.type === 'public' ? 'Public' : 'Private'}
                variant={template.type}
              />
            </View>
          </View>
          <View style={[styles.checkCircle, selected && styles.checkCircleActive]}>
            {selected && (
              <Ionicons name="checkmark" size={16} color={colors.white} />
            )}
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing[2] },
  selected: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceAlt,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  content: { flex: 1 },
  title: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
    color: colors.text,
    marginBottom: 4,
  },
  desc: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    lineHeight: typography.sm * 1.5,
    marginBottom: spacing[2],
  },
  tags: {
    flexDirection: 'row',
    gap: spacing[2],
    flexWrap: 'wrap',
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
});
