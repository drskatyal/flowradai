import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Modal,
  Pressable,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Badge } from '../../src/components/ui/Badge';
import { MOCK_REPORTS } from '../../src/stores/appStore';
import { colors, typography, spacing, radius } from '../../src/theme';

export default function ReportScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [showActions, setShowActions] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);

  const report = MOCK_REPORTS.find((r) => r.id === id) ?? MOCK_REPORTS[0];
  const isAbnormal = report.category === 'abnormal';

  async function handleShare() {
    await Share.share({ message: report.content, title: report.title });
  }

  // Sections derived from report content
  const sections = report.content.split('\n\n').map((block) => {
    const lines = block.trim().split('\n');
    const heading = lines[0].toUpperCase() === lines[0] && lines[0].length < 50;
    return { heading: heading ? lines[0] : null, body: heading ? lines.slice(1).join('\n') : block };
  }).filter((s) => s.body.trim());

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <LinearGradient colors={['#060A14', '#080E1C']} style={StyleSheet.absoluteFill} />

      {/* Nav bar */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.navTitle} numberOfLines={1}>Report</Text>
        <View style={styles.navActions}>
          <TouchableOpacity style={styles.navBtn} onPress={handleShare}>
            <Ionicons name="share-outline" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navBtn} onPress={() => setShowActions(true)}>
            <Ionicons name="ellipsis-vertical" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + spacing[10] }]}>
        {/* Report header */}
        <View style={styles.reportHeader}>
          <View style={styles.reportMeta}>
            <Badge label={isAbnormal ? 'Abnormal' : 'Normal'} variant={isAbnormal ? 'abnormal' : 'normal'} />
            {report.templateTitle && (
              <View style={styles.templateTag}>
                <Ionicons name="document-text-outline" size={12} color={colors.textMuted} />
                <Text style={styles.templateTagText}>{report.templateTitle}</Text>
              </View>
            )}
          </View>
          <Text style={styles.reportTitle}>{report.title}</Text>
          <View style={styles.reportInfo}>
            <View style={styles.infoItem}>
              <Ionicons name="time-outline" size={13} color={colors.textMuted} />
              <Text style={styles.infoText}>
                {new Date(report.createdAt).toLocaleString('en-GB', {
                  day: 'numeric', month: 'short', year: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="flash-outline" size={13} color={colors.textMuted} />
              <Text style={styles.infoText}>{report.model}</Text>
            </View>
          </View>
        </View>

        {/* Transcription */}
        <TouchableOpacity
          style={styles.transcriptToggle}
          onPress={() => setShowTranscript((v) => !v)}
        >
          <View style={styles.transcriptToggleLeft}>
            <View style={styles.micIcon}>
              <Ionicons name="mic-outline" size={16} color={colors.primaryLight} />
            </View>
            <Text style={styles.transcriptToggleText}>Dictation Transcript</Text>
          </View>
          <Ionicons
            name={showTranscript ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={colors.textMuted}
          />
        </TouchableOpacity>
        {showTranscript && (
          <View style={styles.transcriptBody}>
            <Text style={styles.transcriptText}>{report.transcription}</Text>
          </View>
        )}

        {/* Report body */}
        <View style={styles.reportBody}>
          {sections.map((sec, i) => (
            <View key={i} style={styles.section}>
              {sec.heading && (
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionLine} />
                  <Text style={styles.sectionHeading}>{sec.heading}</Text>
                  <View style={styles.sectionLine} />
                </View>
              )}
              <Text style={styles.sectionBody}>{sec.body}</Text>
            </View>
          ))}
        </View>

        {/* AI Quality badges */}
        <View style={styles.qualityRow}>
          <Text style={styles.qualityLabel}>AI Quality Assessment</Text>
          <View style={styles.qualityBadges}>
            {[
              { icon: 'shield-checkmark-outline' as const, label: 'Validated', color: colors.successLight },
              { icon: 'book-outline' as const, label: 'Guidelines Met', color: colors.primaryLight },
              { icon: 'checkmark-done-outline' as const, label: 'No Errors', color: colors.successLight },
            ].map((b, i) => (
              <View key={i} style={[styles.qualityBadge, { borderColor: b.color + '40', backgroundColor: b.color + '15' }]}>
                <Ionicons name={b.icon} size={14} color={b.color} />
                <Text style={[styles.qualityBadgeText, { color: b.color }]}>{b.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
            <Ionicons name="mail-outline" size={20} color={colors.primaryLight} />
            <Text style={styles.actionBtnText}>Email Report</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons name="download-outline" size={20} color={colors.primaryLight} />
            <Text style={styles.actionBtnText}>Export DOCX</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons name="copy-outline" size={20} color={colors.primaryLight} />
            <Text style={styles.actionBtnText}>Copy Text</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Actions modal */}
      <Modal visible={showActions} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowActions(false)}>
          <View style={[styles.actionMenu, { marginTop: insets.top + 60, marginRight: spacing[5] }]}>
            {[
              { icon: 'pencil-outline' as const, label: 'Edit Report' },
              { icon: 'copy-outline' as const, label: 'Copy to Clipboard' },
              { icon: 'download-outline' as const, label: 'Export as DOCX' },
              { icon: 'mail-outline' as const, label: 'Share via Email' },
              { icon: 'archive-outline' as const, label: 'Archive' },
              { icon: 'trash-outline' as const, label: 'Delete Report', danger: true },
            ].map((item, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.menuItem, i < 5 && styles.menuItemBorder]}
                onPress={() => setShowActions(false)}
              >
                <Ionicons
                  name={item.icon}
                  size={18}
                  color={item.danger ? colors.errorLight : colors.textSecondary}
                />
                <Text style={[styles.menuItemText, item.danger && styles.menuItemDanger]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: { padding: spacing[2] },
  navTitle: {
    flex: 1,
    fontSize: typography.md,
    fontWeight: typography.semibold,
    color: colors.text,
    marginLeft: spacing[2],
  },
  navActions: { flexDirection: 'row', gap: spacing[1] },
  navBtn: { padding: spacing[2] },
  scroll: { paddingHorizontal: spacing[5], paddingTop: spacing[4] },

  // Report header
  reportHeader: {
    marginBottom: spacing[4],
    gap: spacing[3],
  },
  reportMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  templateTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing[2],
    paddingVertical: 3,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.full,
  },
  templateTagText: { fontSize: typography.xs, color: colors.textMuted },
  reportTitle: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    color: colors.text,
    lineHeight: typography.xl * 1.3,
  },
  reportInfo: { flexDirection: 'row', gap: spacing[4] },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  infoText: { fontSize: typography.xs, color: colors.textMuted },

  // Transcript
  transcriptToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing[4],
    marginBottom: spacing[2],
  },
  transcriptToggleLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  micIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transcriptToggleText: { fontSize: typography.sm, fontWeight: typography.medium, color: colors.textSecondary },
  transcriptBody: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing[4],
    marginBottom: spacing[4],
  },
  transcriptText: { fontSize: typography.sm, color: colors.textSecondary, lineHeight: typography.sm * 1.7, fontStyle: 'italic' },

  // Report body
  reportBody: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing[5],
    marginBottom: spacing[4],
    gap: spacing[4],
  },
  section: { gap: spacing[2] },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  sectionLine: { flex: 1, height: 1, backgroundColor: colors.border },
  sectionHeading: {
    fontSize: typography.xs,
    fontWeight: typography.bold,
    color: colors.textMuted,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  sectionBody: {
    fontSize: typography.sm,
    color: colors.text,
    lineHeight: typography.sm * 1.8,
  },

  // Quality
  qualityRow: {
    gap: spacing[3],
    marginBottom: spacing[4],
  },
  qualityLabel: { fontSize: typography.xs, color: colors.textMuted, fontWeight: typography.semibold, textTransform: 'uppercase', letterSpacing: 0.8 },
  qualityBadges: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  qualityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: radius.full,
    borderWidth: 1,
  },
  qualityBadgeText: { fontSize: typography.xs, fontWeight: typography.semibold },

  // Action row
  actionRow: {
    flexDirection: 'row',
    gap: spacing[3],
    marginBottom: spacing[4],
  },
  actionBtn: {
    flex: 1,
    alignItems: 'center',
    gap: spacing[2],
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing[4],
  },
  actionBtnText: { fontSize: typography.xs, color: colors.primaryLight, fontWeight: typography.medium },

  // Context menu
  modalOverlay: { flex: 1, alignItems: 'flex-end' },
  actionMenu: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    width: 220,
    overflow: 'hidden',
    ...({ shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 20 } as any),
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
  },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  menuItemText: { fontSize: typography.sm, color: colors.textSecondary },
  menuItemDanger: { color: colors.errorLight },
});
