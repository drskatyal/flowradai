import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform,
  Animated, ActivityIndicator, Modal, Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MicButton } from '../../src/components/MicButton';
import { WaveformBars } from '../../src/components/WaveformBars';
import { Badge } from '../../src/components/ui/Badge';
import {
  useAppStore, MOCK_TEMPLATES, MOCK_MACROS, TRANSCRIPTION_SAMPLES, REPORT_SAMPLES,
  type Template, type Macro, type ChatMessage,
} from '../../src/stores/appStore';
import { colors, typography, spacing, radius, shadows } from '../../src/theme';

type WorkflowStep = 'idle' | 'recording' | 'transcribing' | 'ready' | 'generating';
type MicModel = 'Voxtral Mini' | 'Soniox';
type WorkspaceTab = 'template' | 'dictate' | 'report';

type ReportEntry = {
  id: string;
  type: 'report' | 'revision';
  content: string;
  version?: number;
  templateTitle?: string;
  category?: 'normal' | 'abnormal' | '';
  model?: string;
  createdAt: string;
};

// ─── Rich report renderer ───────────────────────────────────────────────────────
function RichReport({ content }: { content: string }) {
  const lines = content.split('\n');
  return (
    <View style={rr.root}>
      {lines.map((line, i) => {
        const t = line.trim();
        if (!t) return <View key={i} style={rr.gap} />;
        const isHeading = /^[A-Z][A-Z\s\/\-—]+[A-Z:]$/.test(t) || /^[A-Z ]+:$/.test(t);
        const isList = /^\d+\./.test(t);
        if (isHeading) return (
          <View key={i} style={rr.headingRow}>
            <Text style={rr.heading}>{t}</Text>
          </View>
        );
        if (isList) {
          const dotIdx = t.indexOf('. ');
          const num = t.substring(0, dotIdx);
          const body = t.substring(dotIdx + 2);
          return (
            <View key={i} style={rr.listRow}>
              <View style={rr.numBadge}><Text style={rr.numText}>{num}</Text></View>
              <Text style={rr.listBody}>{body}</Text>
            </View>
          );
        }
        return <Text key={i} style={rr.body}>{t}</Text>;
      })}
    </View>
  );
}
const rr = StyleSheet.create({
  root: { gap: 3 },
  gap: { height: 10 },
  headingRow: { marginTop: 8, marginBottom: 3, paddingBottom: 6, borderBottomWidth: 1, borderBottomColor: colors.border },
  heading: { fontSize: typography.xs, fontWeight: typography.bold, color: colors.primaryLight, letterSpacing: 1, textTransform: 'uppercase' },
  listRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginVertical: 1 },
  numBadge: { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.primarySoft, borderWidth: 1, borderColor: 'rgba(96,165,250,0.2)', alignItems: 'center', justifyContent: 'center', marginTop: 2, flexShrink: 0 },
  numText: { fontSize: 9, fontWeight: typography.bold, color: colors.primaryLight },
  listBody: { flex: 1, fontSize: typography.sm, color: colors.text, lineHeight: typography.sm * 1.7 },
  body: { fontSize: typography.sm, color: colors.text, lineHeight: typography.sm * 1.75 },
});

// ─── Template card ──────────────────────────────────────────────────────────────
function TemplateCard({ template, selected, onSelect }: {
  template: Template; selected: boolean; onSelect: () => void;
}) {
  const isAbnormal = template.category === 'abnormal';
  const accentColor = isAbnormal ? colors.warningLight : colors.successLight;
  const accentBg = isAbnormal ? colors.warningSoft : colors.successSoft;
  return (
    <TouchableOpacity
      style={[tc.card, selected && tc.cardSelected]}
      onPress={onSelect}
      activeOpacity={0.75}
    >
      <View style={[tc.accent, { backgroundColor: accentColor }]} />
      <View style={[tc.dot, { backgroundColor: accentBg, borderColor: accentColor + '40' }]}>
        <Ionicons name="document-text-outline" size={13} color={accentColor} />
      </View>
      <View style={tc.info}>
        <View style={tc.titleRow}>
          <Text style={[tc.title, selected && tc.titleSelected]} numberOfLines={1}>{template.title}</Text>
          {template.type === 'private' && <Ionicons name="lock-closed" size={10} color={colors.textDisabled} />}
        </View>
        <Text style={tc.desc} numberOfLines={1}>{template.description}</Text>
      </View>
      {selected && <Ionicons name="checkmark-circle-sharp" size={18} color={colors.primaryLight} />}
    </TouchableOpacity>
  );
}
const tc = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: spacing[3], backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingVertical: spacing[3], paddingRight: spacing[3], marginBottom: 6, overflow: 'hidden' },
  cardSelected: { borderColor: 'rgba(96,165,250,0.30)', backgroundColor: 'rgba(37,99,235,0.07)' },
  accent: { width: 3, alignSelf: 'stretch', borderRadius: 2, marginLeft: 0, flexShrink: 0 },
  dot: { width: 30, height: 30, borderRadius: radius.sm, borderWidth: 1, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  info: { flex: 1, gap: 2 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  title: { fontSize: typography.sm, fontWeight: typography.semibold, color: colors.textSecondary, flex: 1 },
  titleSelected: { color: colors.text },
  desc: { fontSize: typography.xs, color: colors.textMuted },
});

// ─── AI match chip ──────────────────────────────────────────────────────────────
function AiMatch({ template, score, selected, onSelect }: {
  template: Template; score: number; selected: boolean; onSelect: () => void;
}) {
  return (
    <TouchableOpacity style={[am.chip, selected && am.chipSel]} onPress={onSelect} activeOpacity={0.75}>
      <View style={am.score}><Text style={am.scoreText}>{score}%</Text></View>
      <Text style={[am.label, selected && am.labelSel]} numberOfLines={1}>{template.title}</Text>
      {selected && <Ionicons name="checkmark-circle-sharp" size={16} color={colors.primaryLight} />}
    </TouchableOpacity>
  );
}
const am = StyleSheet.create({
  chip: { flexDirection: 'row', alignItems: 'center', gap: spacing[2], backgroundColor: colors.surface, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing[3], paddingVertical: spacing[2], marginRight: spacing[2] },
  chipSel: { borderColor: 'rgba(96,165,250,0.35)', backgroundColor: colors.primarySoft },
  score: { backgroundColor: colors.primarySoft, borderRadius: radius.full, paddingHorizontal: 6, paddingVertical: 2 },
  scoreText: { fontSize: 10, fontWeight: typography.bold, color: colors.primaryLight },
  label: { fontSize: typography.sm, color: colors.textSecondary, fontWeight: typography.medium },
  labelSel: { color: colors.primaryLight },
});

// ─── Macro chip ─────────────────────────────────────────────────────────────────
function MacroChip({ macro, onInsert }: { macro: Macro; onInsert: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={mcc.wrap}>
      <TouchableOpacity style={mcc.row} onPress={() => setOpen(v => !v)} activeOpacity={0.75}>
        <View style={mcc.icon}><Ionicons name="bookmark" size={13} color={colors.warningLight} /></View>
        <Text style={mcc.name}>{macro.name}</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={13} color={colors.textMuted} />
      </TouchableOpacity>
      {open && (
        <View style={mcc.body}>
          <Text style={mcc.preview} numberOfLines={3}>{macro.description}</Text>
          <TouchableOpacity style={mcc.insert} onPress={onInsert}>
            <Ionicons name="add-circle-outline" size={13} color={colors.successLight} />
            <Text style={mcc.insertText}>Insert</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
const mcc = StyleSheet.create({
  wrap: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', marginBottom: spacing[2] },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing[3], padding: spacing[3] },
  icon: { width: 28, height: 28, borderRadius: 8, backgroundColor: colors.warningSoft, alignItems: 'center', justifyContent: 'center' },
  name: { flex: 1, fontSize: typography.sm, fontWeight: typography.medium, color: colors.text },
  body: { padding: spacing[3], borderTopWidth: 1, borderTopColor: colors.border, gap: spacing[2] },
  preview: { fontSize: typography.xs, color: colors.textSecondary, lineHeight: typography.xs * 1.6 },
  insert: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', paddingHorizontal: spacing[3], paddingVertical: spacing[1], backgroundColor: colors.successSoft, borderRadius: radius.full, borderWidth: 1, borderColor: 'rgba(52,211,153,0.20)' },
  insertText: { fontSize: typography.xs, color: colors.successLight, fontWeight: typography.semibold },
});

// ─── Chat bubbles ───────────────────────────────────────────────────────────────
function UserBubble({ msg }: { msg: ChatMessage }) {
  return (
    <View style={bub.uWrap}>
      <View style={bub.uBubble}>
        {msg.templateTitle && (
          <View style={bub.templateTag}>
            <Ionicons name="document-text-outline" size={10} color={colors.primaryLight} />
            <Text style={bub.templateTagText}>{msg.templateTitle}</Text>
          </View>
        )}
        <Text style={bub.uText}>{msg.content}</Text>
        <Text style={bub.time}>{new Date(msg.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</Text>
      </View>
    </View>
  );
}

function AssistantBubble({ msg, onView }: { msg: ChatMessage; onView: () => void }) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const lines = msg.content.split('\n');
  const preview = lines.slice(0, 10).join('\n');
  const hasMore = lines.length > 10;

  return (
    <View style={bub.aWrap}>
      <View style={bub.aAvatar}><Ionicons name="radio-outline" size={15} color={colors.primaryLight} /></View>
      <View style={bub.aContent}>
        <View style={bub.aHeader}>
          <Text style={bub.aLabel}>FlowradAI</Text>
          {msg.model && <Text style={bub.aModel}>{msg.model}</Text>}
          <Badge label={msg.category === 'abnormal' ? 'Abnormal' : 'Normal'} variant={msg.category === 'abnormal' ? 'abnormal' : 'normal'} />
        </View>
        <View style={bub.reportCard}>
          {msg.templateTitle && (
            <View style={bub.reportHeader}>
              <Ionicons name="document-text-outline" size={11} color={colors.primaryLight} />
              <Text style={bub.reportHeaderText}>{msg.templateTitle}</Text>
            </View>
          )}
          <View style={bub.reportBody}>
            <RichReport content={expanded ? msg.content : preview} />
            {hasMore && (
              <TouchableOpacity style={bub.expandBtn} onPress={() => setExpanded(v => !v)}>
                <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={13} color={colors.primaryLight} />
                <Text style={bub.expandText}>{expanded ? 'Collapse' : 'Show full report'}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        <View style={bub.actions}>
          {[
            { icon: copied ? 'checkmark' : 'copy-outline', label: copied ? 'Copied' : 'Copy', onPress: () => { setCopied(true); setTimeout(() => setCopied(false), 2000); }, active: copied },
            { icon: 'expand-outline', label: 'View', onPress: onView },
            { icon: 'download-outline', label: 'Export', onPress: () => {} },
            { icon: 'mail-outline', label: 'Email', onPress: () => {} },
          ].map(({ icon, label, onPress, active }) => (
            <TouchableOpacity key={label} style={bub.actionBtn} onPress={onPress}>
              <Ionicons name={icon as any} size={13} color={active ? colors.successLight : colors.textMuted} />
              <Text style={[bub.actionText, active && { color: colors.successLight }]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={bub.time}>{new Date(msg.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</Text>
      </View>
    </View>
  );
}
const bub = StyleSheet.create({
  uWrap: { alignItems: 'flex-end', marginBottom: spacing[4] },
  uBubble: { maxWidth: '82%', backgroundColor: 'rgba(37,99,235,0.14)', borderRadius: radius.lg, borderTopRightRadius: 4, borderWidth: 1, borderColor: 'rgba(96,165,250,0.18)', padding: spacing[4], gap: spacing[2] },
  templateTag: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  templateTagText: { fontSize: 10, color: colors.primaryLight, fontWeight: typography.medium },
  uText: { fontSize: typography.sm, color: colors.text, lineHeight: typography.sm * 1.6 },
  time: { fontSize: 10, color: colors.textDisabled, alignSelf: 'flex-end', marginTop: 2 },
  aWrap: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing[3], marginBottom: spacing[5] },
  aAvatar: { width: 30, height: 30, borderRadius: radius.md, backgroundColor: colors.primarySoft, borderWidth: 1, borderColor: 'rgba(96,165,250,0.18)', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 },
  aContent: { flex: 1, gap: spacing[2] },
  aHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing[2], flexWrap: 'wrap' },
  aLabel: { fontSize: typography.xs, fontWeight: typography.bold, color: colors.textSecondary },
  aModel: { fontSize: 10, color: colors.textMuted, fontWeight: typography.medium },
  reportCard: { backgroundColor: colors.surface, borderRadius: radius.lg, borderTopLeftRadius: 4, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  reportHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing[2], backgroundColor: colors.primarySoft, paddingHorizontal: spacing[4], paddingVertical: spacing[2], borderBottomWidth: 1, borderBottomColor: 'rgba(96,165,250,0.15)' },
  reportHeaderText: { fontSize: typography.xs, color: colors.primaryLight, fontWeight: typography.semibold },
  reportBody: { padding: spacing[4] },
  expandBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing[3], paddingTop: spacing[3], borderTopWidth: 1, borderTopColor: colors.border },
  expandText: { fontSize: typography.xs, color: colors.primaryLight, fontWeight: typography.semibold },
  actions: { flexDirection: 'row', gap: spacing[2], flexWrap: 'wrap' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: spacing[3], paddingVertical: 7, backgroundColor: colors.surface, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border },
  actionText: { fontSize: 11, color: colors.textMuted },
});

// ─── Report card (versioned) ───────────────────────────────────────────────────
function ReportCard({ entry, onViewFull }: { entry: ReportEntry; onViewFull: () => void }) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const lines = entry.content.split('\n');
  const preview = lines.slice(0, 12).join('\n');
  const hasMore = lines.length > 12;

  function handleCopy() {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(entry.content).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <View style={rc.card}>
      {/* Card header */}
      <View style={rc.header}>
        <View style={rc.headerLeft}>
          <View style={rc.avatar}><Ionicons name="radio-outline" size={13} color={colors.primaryLight} /></View>
          <Text style={rc.aiLabel}>FlowradAI</Text>
          {entry.model && <Text style={rc.model}>{entry.model}</Text>}
        </View>
        <View style={rc.headerRight}>
          {entry.category && (
            <Badge label={entry.category === 'abnormal' ? 'Abnormal' : 'Normal'} variant={entry.category === 'abnormal' ? 'abnormal' : 'normal'} />
          )}
          <View style={rc.vBadge}><Text style={rc.vBadgeText}>v{entry.version}</Text></View>
        </View>
      </View>

      {/* Template strip */}
      {entry.templateTitle && (
        <View style={rc.templateStrip}>
          <Ionicons name="document-text-outline" size={11} color={colors.primaryLight} />
          <Text style={rc.templateStripText}>{entry.templateTitle}</Text>
        </View>
      )}

      {/* Body */}
      <View style={rc.body}>
        <RichReport content={expanded ? entry.content : preview} />
        {hasMore && (
          <TouchableOpacity style={rc.expandBtn} onPress={() => setExpanded(v => !v)}>
            <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={13} color={colors.primaryLight} />
            <Text style={rc.expandText}>{expanded ? 'Collapse' : 'Show full report'}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Action row */}
      <View style={rc.actions}>
        <TouchableOpacity style={[rc.actionBtn, copied && rc.actionBtnSuccess]} onPress={handleCopy}>
          <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={13} color={copied ? colors.successLight : colors.primaryLight} />
          <Text style={[rc.actionText, copied && { color: colors.successLight }]}>{copied ? 'Copied!' : 'Copy'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={rc.actionBtn} onPress={() => {}}>
          <Ionicons name="download-outline" size={13} color={colors.primaryLight} />
          <Text style={rc.actionText}>Export</Text>
        </TouchableOpacity>
        <TouchableOpacity style={rc.actionBtn} onPress={() => {}}>
          <Ionicons name="share-outline" size={13} color={colors.primaryLight} />
          <Text style={rc.actionText}>Share</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[rc.actionBtn, rc.actionBtnGhost]} onPress={onViewFull}>
          <Ionicons name="expand-outline" size={13} color={colors.textMuted} />
          <Text style={[rc.actionText, { color: colors.textMuted }]}>Full</Text>
        </TouchableOpacity>
      </View>

      <Text style={rc.time}>{new Date(entry.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</Text>
    </View>
  );
}
const rc = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', marginBottom: spacing[4] },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing[4], paddingVertical: spacing[3], borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  avatar: { width: 26, height: 26, borderRadius: radius.md, backgroundColor: colors.primarySoft, borderWidth: 1, borderColor: 'rgba(96,165,250,0.18)', alignItems: 'center', justifyContent: 'center' },
  aiLabel: { fontSize: typography.xs, fontWeight: typography.bold, color: colors.textSecondary },
  model: { fontSize: 10, color: colors.textMuted, fontWeight: typography.medium },
  vBadge: { backgroundColor: colors.warningSoft, borderRadius: radius.full, paddingHorizontal: spacing[2], paddingVertical: 2, borderWidth: 1, borderColor: 'rgba(251,191,36,0.25)' },
  vBadgeText: { fontSize: 10, fontWeight: typography.bold, color: colors.warningLight },
  templateStrip: { flexDirection: 'row', alignItems: 'center', gap: spacing[2], backgroundColor: colors.primarySoft, paddingHorizontal: spacing[4], paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: 'rgba(96,165,250,0.12)' },
  templateStripText: { fontSize: typography.xs, color: colors.primaryLight, fontWeight: typography.semibold },
  body: { padding: spacing[4] },
  expandBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing[3], paddingTop: spacing[3], borderTopWidth: 1, borderTopColor: colors.border },
  expandText: { fontSize: typography.xs, color: colors.primaryLight, fontWeight: typography.semibold },
  actions: { flexDirection: 'row', gap: spacing[2], paddingHorizontal: spacing[4], paddingBottom: spacing[3] },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: spacing[3], paddingVertical: 7, backgroundColor: colors.primarySoft, borderRadius: radius.full, borderWidth: 1, borderColor: 'rgba(96,165,250,0.20)' },
  actionBtnSuccess: { backgroundColor: colors.successSoft, borderColor: 'rgba(52,211,153,0.20)' },
  actionBtnGhost: { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
  actionText: { fontSize: 11, color: colors.primaryLight, fontWeight: typography.medium },
  time: { fontSize: 10, color: colors.textDisabled, paddingHorizontal: spacing[4], paddingBottom: spacing[3], textAlign: 'right' },
});

// ─── Main ───────────────────────────────────────────────────────────────────────
export default function WorkspaceScreen() {
  const insets = useSafeAreaInsets();
  const user = useAppStore(s => s.user);
  const messages = useAppStore(s => s.messages);
  const addMessage = useAppStore(s => s.addMessage);
  const clearMessages = useAppStore(s => s.clearMessages);

  const [tab, setTab] = useState<WorkspaceTab>('template');
  const [step, setStep] = useState<WorkflowStep>('idle');
  const [micModel, setMicModel] = useState<MicModel>('Voxtral Mini');
  const [findings, setFindings] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [aiMatches, setAiMatches] = useState<{ template: Template; score: number }[]>([]);
  const [macroMatches, setMacroMatches] = useState<Macro[]>([]);
  const [recordSecs, setRecordSecs] = useState(0);
  const [templateSearch, setTemplateSearch] = useState('');
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [autoRefining, setAutoRefining] = useState(false);
  const [reportThread, setReportThread] = useState<ReportEntry[]>([]);
  const [revisionText, setRevisionText] = useState('');
  const [isRevising, setIsRevising] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inputRef = useRef<TextInput>(null);
  const reportScrollRef = useRef<ScrollView>(null);
  const tabAnim = useRef(new Animated.Value(0)).current;

  // Tab switch animation
  useEffect(() => {
    Animated.timing(tabAnim, { toValue: tab === 'template' ? 0 : tab === 'dictate' ? 1 : 2, duration: 200, useNativeDriver: false }).start();
  }, [tab]);

  // Macro detection
  useEffect(() => {
    const lower = findings.toLowerCase();
    if (lower.includes('insert ')) {
      const word = lower.split('insert ')[1]?.split(' ')[0] ?? '';
      setMacroMatches(MOCK_MACROS.filter(m => m.isActive && m.name.toLowerCase().includes(word) && word.length > 1));
    } else {
      setMacroMatches([]);
    }
  }, [findings]);

  function handleMicPress() {
    if (step === 'idle' || step === 'ready') {
      setStep('recording');
      setTab('dictate');
      setRecordSecs(0);
      timerRef.current = setInterval(() => setRecordSecs(s => s + 1), 1000);
    } else if (step === 'recording') {
      if (timerRef.current) clearInterval(timerRef.current);
      setStep('transcribing');
      setTimeout(() => {
        const sid = user?.specialityId ?? '1';
        const sample = sid === '2' ? TRANSCRIPTION_SAMPLES.neuro : sid === '3' ? TRANSCRIPTION_SAMPLES.msk : TRANSCRIPTION_SAMPLES.default;
        setFindings(sample);
        const matches = MOCK_TEMPLATES
          .filter(t => t.specialityId === sid || t.specialityId === '1')
          .slice(0, 3)
          .map((t, i) => ({ template: t, score: 95 - i * 7 }));
        setAiMatches(matches);
        if (matches[0] && !selectedTemplate) setSelectedTemplate(matches[0].template);
        setStep('ready');
        setTimeout(() => inputRef.current?.focus(), 300);
      }, 1600);
    }
  }

  async function generate(useTemplate: boolean) {
    if (!findings.trim()) return;
    setStep('generating');
    setAiMatches([]);
    setMacroMatches([]);

    await new Promise(r => setTimeout(r, 2200));

    const sid = user?.specialityId ?? '1';
    const content = sid === '2' ? REPORT_SAMPLES.neuro : REPORT_SAMPLES.default;
    const entry: ReportEntry = {
      id: Date.now().toString(),
      type: 'report',
      version: 1,
      content,
      templateTitle: useTemplate ? selectedTemplate?.title : undefined,
      category: useTemplate && selectedTemplate?.category === 'abnormal' ? 'abnormal' : 'normal',
      model: micModel,
      createdAt: new Date().toISOString(),
    };
    setReportThread([entry]);
    setFindings('');
    setStep('idle');
    setTab('report');
    setTimeout(() => reportScrollRef.current?.scrollToEnd({ animated: true }), 200);
  }

  async function handleRevise() {
    const text = revisionText.trim();
    if (!text || isRevising) return;
    setIsRevising(true);
    setRevisionText('');

    const revEntry: ReportEntry = {
      id: Date.now().toString(),
      type: 'revision',
      content: text,
      createdAt: new Date().toISOString(),
    };
    setReportThread(prev => [...prev, revEntry]);
    setTimeout(() => reportScrollRef.current?.scrollToEnd({ animated: true }), 100);

    await new Promise(r => setTimeout(r, 1800));

    const currentVersion = reportThread.filter(e => e.type === 'report').length;
    const lastReport = reportThread.filter(e => e.type === 'report').at(-1);
    // Simulate AI revision — prepend a revision note to existing content
    const revisedContent = (lastReport?.content ?? REPORT_SAMPLES.default)
      .replace('IMPRESSION:', `REVISION NOTE:\nRevised per request: "${text}"\n\nIMPRESSION:`);

    const newEntry: ReportEntry = {
      id: (Date.now() + 1).toString(),
      type: 'report',
      version: currentVersion + 1,
      content: revisedContent,
      templateTitle: lastReport?.templateTitle,
      category: lastReport?.category,
      model: micModel,
      createdAt: new Date().toISOString(),
    };
    setReportThread(prev => [...prev, newEntry]);
    setIsRevising(false);
    setTimeout(() => reportScrollRef.current?.scrollToEnd({ animated: true }), 200);
  }

  async function handleRefine() {
    if (!findings.trim() || autoRefining) return;
    setAutoRefining(true);
    await new Promise(r => setTimeout(r, 1000));
    const refined = findings
      .replace(/\b(ct|mri|cxr|pa|ap)\b/gi, m => m.toUpperCase())
      .replace(/\.\s*([a-z])/g, (_, c) => '. ' + c.toUpperCase())
      .trim();
    setFindings(refined.endsWith('.') ? refined : refined + '.');
    setAutoRefining(false);
  }

  function insertMacro(macro: Macro) {
    const cleaned = findings.replace(/insert \w+/i, '').trim();
    setFindings(cleaned ? cleaned + ' ' + macro.description : macro.description);
    setMacroMatches([]);
  }

  function startNew() {
    setFindings('');
    setSelectedTemplate(null);
    setAiMatches([]);
    setMacroMatches([]);
    setReportThread([]);
    setRevisionText('');
    setStep('idle');
    setTab('template');
  }

  const fmt = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
  const hasFindings = findings.trim().length > 0;
  const isGenerating = step === 'generating';
  const MODELS: MicModel[] = ['Voxtral Mini', 'Soniox'];
  const filteredTemplates = MOCK_TEMPLATES.filter(t =>
    !templateSearch || t.title.toLowerCase().includes(templateSearch.toLowerCase()) || t.description.toLowerCase().includes(templateSearch.toLowerCase())
  );

  return (
    <KeyboardAvoidingView
      style={[s.root, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      {/* ── Header ── */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <View style={s.logoMark}>
            <Ionicons name="radio-outline" size={15} color={colors.primaryLight} />
          </View>
          <View>
            <Text style={s.headerTitle}>Reporting Workspace</Text>
            <Text style={s.headerSub}>{user?.specialityName ?? 'Radiology'}</Text>
          </View>
        </View>
        <View style={s.headerRight}>
          <View style={s.creditPill}>
            <Ionicons name="flash" size={11} color={colors.warningLight} />
            <Text style={s.creditText}>{user?.availableCredits ?? 0}</Text>
          </View>
          <TouchableOpacity style={s.iconBtn} onPress={() => { clearMessages(); startNew(); }}>
            <Ionicons name="add" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={s.iconBtn} onPress={() => router.push('/(app)/profile')}>
            <View style={s.avatar}><Text style={s.avatarText}>{user?.firstName?.[0] ?? 'D'}</Text></View>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Stats ── */}
      <View style={s.statsRow}>
        {[
          { label: 'Today', value: '8', icon: 'document-text-outline' as const, color: colors.primaryLight },
          { label: 'Week', value: '34', icon: 'calendar-outline' as const, color: colors.successLight },
          { label: 'Avg', value: '42s', icon: 'timer-outline' as const, color: colors.warningLight },
          { label: 'Credits', value: String(user?.availableCredits ?? 0), icon: 'flash-outline' as const, color: colors.warningLight },
        ].map((stat, i) => (
          <View key={i} style={s.statPill}>
            <Ionicons name={stat.icon} size={12} color={stat.color} />
            <Text style={[s.statValue, { color: stat.color }]}>{stat.value}</Text>
            <Text style={s.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* ── Inner tab bar ── */}
      <View style={s.tabBar}>
        {([
          { key: 'template', icon: 'document-text-outline', label: 'Template' },
          { key: 'dictate', icon: 'mic-outline', label: 'Dictate' },
          { key: 'report', icon: 'reader-outline', label: 'Report' },
        ] as { key: WorkspaceTab; icon: any; label: string }[]).map(({ key, icon, label }) => {
          const active = tab === key;
          return (
            <TouchableOpacity
              key={key}
              style={[s.tabItem, active && s.tabItemActive]}
              onPress={() => setTab(key)}
              activeOpacity={0.75}
            >
              <Ionicons name={active ? icon.replace('-outline', '') : icon} size={15} color={active ? colors.primaryLight : colors.textMuted} />
              <Text style={[s.tabLabel, active && s.tabLabelActive]}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── Tab content ── */}
      <View style={s.content}>

        {/* ── TEMPLATE TAB ── */}
        {tab === 'template' && (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabContent} keyboardShouldPersistTaps="handled">
            {/* Search */}
            <View style={s.searchRow}>
              <Ionicons name="search-outline" size={16} color={colors.textMuted} />
              <TextInput
                value={templateSearch}
                onChangeText={setTemplateSearch}
                placeholder="Search templates…"
                placeholderTextColor={colors.textDisabled}
                style={s.searchInput}
              />
              {templateSearch.length > 0 && (
                <TouchableOpacity onPress={() => setTemplateSearch('')}>
                  <Ionicons name="close-circle" size={16} color={colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>

            {/* AI matches (post-transcription) */}
            {aiMatches.length > 0 && (
              <View style={s.sectionBlock}>
                <View style={s.sectionLabel}>
                  <Ionicons name="sparkles" size={12} color={colors.primaryLight} />
                  <Text style={s.sectionLabelText}>AI Matched</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={{ flexDirection: 'row', paddingBottom: spacing[2] }}>
                    {aiMatches.map(({ template, score }) => (
                      <AiMatch key={template.id} template={template} score={score}
                        selected={selectedTemplate?.id === template.id}
                        onSelect={() => setSelectedTemplate(template)} />
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}

            {/* Template list */}
            <View style={s.sectionBlock}>
              {aiMatches.length === 0 && (
                <View style={s.sectionLabel}>
                  <Ionicons name="document-text-outline" size={12} color={colors.textMuted} />
                  <Text style={s.sectionLabelText}>All Templates</Text>
                </View>
              )}
              {filteredTemplates.map(t => (
                <TemplateCard key={t.id} template={t}
                  selected={selectedTemplate?.id === t.id}
                  onSelect={() => setSelectedTemplate(t)} />
              ))}
            </View>

            {/* Macros hint */}
            <View style={s.macroHint}>
              <Ionicons name="information-circle-outline" size={14} color={colors.primaryLight} />
              <Text style={s.macroHintText}>
                Type <Text style={s.macroHintHighlight}>"insert [name]"</Text> in findings to expand macros
              </Text>
            </View>
          </ScrollView>
        )}

        {/* ── DICTATE TAB ── */}
        {tab === 'dictate' && (
          <View style={s.dictateTab}>
            {/* Idle: big mic hero */}
            {step === 'idle' && !hasFindings && (
              <View style={s.micHero}>
                <MicButton isRecording={false} onPress={handleMicPress} size={88} />
                <Text style={s.micHeroTitle}>Tap to start dictating</Text>
                <Text style={s.micHeroSub}>Speak your findings — FlowradAI will transcribe and generate a structured report</Text>
                {selectedTemplate && (
                  <View style={s.templateBadgeRow}>
                    <Ionicons name="document-text-outline" size={13} color={colors.primaryLight} />
                    <Text style={s.templateBadgeText} numberOfLines={1}>{selectedTemplate.title}</Text>
                    <TouchableOpacity onPress={() => setSelectedTemplate(null)}>
                      <Ionicons name="close-circle" size={14} color={colors.textMuted} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}

            {/* Recording state */}
            {step === 'recording' && (
              <View style={s.recordingHero}>
                <MicButton isRecording onPress={handleMicPress} size={88} />
                <Text style={s.recTime}>{fmt(recordSecs)}</Text>
                <Text style={s.recLabel}>Recording… tap to stop</Text>
                <WaveformBars isActive barCount={20} color={colors.mic} />
              </View>
            )}

            {/* Transcribing */}
            {step === 'transcribing' && (
              <View style={s.transcribingHero}>
                <View style={s.transcribingIcon}>
                  <ActivityIndicator size="large" color={colors.primaryLight} />
                </View>
                <Text style={s.transcribingTitle}>Transcribing audio…</Text>
                <Text style={s.transcribingSub}>Processing your dictation</Text>
              </View>
            )}

            {/* Findings textarea (ready / has text) */}
            {(step === 'ready' || (step === 'idle' && hasFindings)) && (
              <View style={s.findingsArea}>
                {/* Macro suggestions */}
                {macroMatches.length > 0 && (
                  <View style={s.macroPanel}>
                    <View style={s.sectionLabel}>
                      <Ionicons name="bookmark" size={12} color={colors.warningLight} />
                      <Text style={[s.sectionLabelText, { color: colors.warningLight }]}>Macro matches</Text>
                    </View>
                    {macroMatches.map(m => <MacroChip key={m.id} macro={m} onInsert={() => insertMacro(m)} />)}
                  </View>
                )}

                <View style={s.textareaCard}>
                  <TextInput
                    ref={inputRef}
                    value={findings}
                    onChangeText={setFindings}
                    placeholder="Findings…"
                    placeholderTextColor={colors.textDisabled}
                    multiline
                    style={s.textarea}
                    textAlignVertical="top"
                  />
                  <View style={s.textareaToolbar}>
                    <TouchableOpacity style={[s.refineBtn, autoRefining && { opacity: 0.5 }]} onPress={handleRefine} disabled={autoRefining}>
                      {autoRefining ? <ActivityIndicator size="small" color={colors.primaryLight} /> : <Ionicons name="sparkles-outline" size={13} color={colors.primaryLight} />}
                      <Text style={s.refineBtnText}>AI Refine</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={s.clearBtn} onPress={() => { setFindings(''); setAiMatches([]); }}>
                      <Ionicons name="trash-outline" size={13} color={colors.textMuted} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          </View>
        )}

        {/* ── REPORT TAB ── */}
        {tab === 'report' && (
          <View style={s.reportTab}>
            {reportThread.length === 0 ? (
              <View style={s.reportEmpty}>
                <View style={s.reportEmptyIcon}>
                  <Ionicons name="reader-outline" size={32} color={colors.textDisabled} />
                </View>
                <Text style={s.reportEmptyTitle}>No report yet</Text>
                <Text style={s.reportEmptySub}>Dictate your findings and generate a report — it will appear here</Text>
                <TouchableOpacity style={s.reportEmptyBtn} onPress={() => setTab('dictate')}>
                  <Text style={s.reportEmptyBtnText}>Go to Dictate</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {/* Thread header */}
                <View style={s.reportThreadHeader}>
                  <View style={s.reportThreadMeta}>
                    <Ionicons name="reader-outline" size={13} color={colors.textMuted} />
                    <Text style={s.reportThreadMetaText}>
                      {reportThread.filter(e => e.type === 'report').length} version{reportThread.filter(e => e.type === 'report').length !== 1 ? 's' : ''}
                    </Text>
                  </View>
                  <TouchableOpacity style={s.newReportBtn} onPress={startNew}>
                    <Ionicons name="add" size={14} color={colors.text} />
                    <Text style={s.newReportText}>New Report</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView
                  ref={reportScrollRef}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={s.reportThreadContent}
                  keyboardShouldPersistTaps="handled"
                >
                  {reportThread.map((entry) =>
                    entry.type === 'revision' ? (
                      /* Revision request bubble */
                      <View key={entry.id} style={s.revBubbleWrap}>
                        <View style={s.revBubble}>
                          <View style={s.revBubbleHeader}>
                            <Ionicons name="create-outline" size={11} color={colors.primaryLight} />
                            <Text style={s.revBubbleLabel}>Revision request</Text>
                          </View>
                          <Text style={s.revBubbleText}>{entry.content}</Text>
                          <Text style={s.revBubbleTime}>{new Date(entry.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</Text>
                        </View>
                      </View>
                    ) : (
                      /* Report card */
                      <ReportCard key={entry.id} entry={entry} onViewFull={() => router.push('/report/r1')} />
                    )
                  )}
                  {isRevising && (
                    <View style={s.revisingSkeleton}>
                      <View style={s.revisingAvatar}>
                        <Ionicons name="radio-outline" size={14} color={colors.primaryLight} />
                      </View>
                      <View style={s.revisingBubble}>
                        <ActivityIndicator size="small" color={colors.primaryLight} />
                        <Text style={s.revisingText}>Generating revision…</Text>
                      </View>
                    </View>
                  )}
                </ScrollView>

                {/* Revision input */}
                <View style={s.revisionBar}>
                  <TextInput
                    value={revisionText}
                    onChangeText={setRevisionText}
                    placeholder="Request a revision…"
                    placeholderTextColor={colors.textDisabled}
                    style={s.revisionInput}
                    multiline
                    onSubmitEditing={handleRevise}
                    blurOnSubmit={false}
                  />
                  <TouchableOpacity
                    style={[s.revisionSend, (!revisionText.trim() || isRevising) && s.revisionSendDisabled]}
                    onPress={handleRevise}
                    disabled={!revisionText.trim() || isRevising}
                  >
                    <Ionicons name="arrow-up" size={17} color={colors.white} />
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        )}
      </View>

      {/* ── Dictate tab bottom panel ── */}
      {tab === 'dictate' && (
        <View style={[s.dictatePanel, { paddingBottom: insets.bottom + 84 }]}>
          {/* Mic row — only when findings exist (hero handles idle state) */}
          <View style={s.micRow}>
            <TouchableOpacity style={s.modelPill} onPress={() => setShowModelPicker(true)}>
              <Ionicons name="radio-outline" size={12} color={colors.textMuted} />
              <Text style={s.modelPillText}>{micModel}</Text>
              <Ionicons name="chevron-down" size={11} color={colors.textMuted} />
            </TouchableOpacity>
            {hasFindings && (step === 'ready' || step === 'idle') && (
              <MicButton isRecording={false} onPress={handleMicPress} size={48} />
            )}
            {step === 'recording' && (
              <MicButton isRecording onPress={handleMicPress} size={48} />
            )}
            <Text style={s.micRowHint}>
              {step === 'recording' ? fmt(recordSecs) : step === 'transcribing' ? 'Processing…' : hasFindings ? 'Re-dictate' : ''}
            </Text>
          </View>

          {/* Generate buttons */}
          <TouchableOpacity
            style={[s.smartGenBtn, (!hasFindings || isGenerating) && s.btnDisabled]}
            onPress={() => generate(false)}
            disabled={!hasFindings || isGenerating}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={hasFindings && !isGenerating ? ['#1D4ED8', '#3B82F6'] : [colors.surfaceAlt, colors.surfaceAlt]}
              style={s.smartGenGrad}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            >
              {isGenerating
                ? <><ActivityIndicator size="small" color={colors.white} /><Text style={s.smartGenText}>Generating…</Text></>
                : <><Ionicons name="flash" size={17} color={hasFindings ? colors.white : colors.textDisabled} /><Text style={[s.smartGenText, !hasFindings && s.btnTextDim]}>Smart Generation</Text></>
              }
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.useTemplateBtn, (!hasFindings || !selectedTemplate) && s.btnDisabled]}
            onPress={() => generate(true)}
            disabled={!hasFindings || !selectedTemplate || isGenerating}
            activeOpacity={0.85}
          >
            <Ionicons name="document-text-outline" size={15} color={hasFindings && selectedTemplate ? colors.primaryLight : colors.textDisabled} />
            <Text style={[s.useTemplateText, (!hasFindings || !selectedTemplate) && s.btnTextDim]}>
              {selectedTemplate ? `Use: ${selectedTemplate.title}` : 'Use Template (select one first)'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Model picker ── */}
      <Modal visible={showModelPicker} transparent animationType="fade">
        <Pressable style={m.backdrop} onPress={() => setShowModelPicker(false)}>
          <View style={m.menu}>
            <Text style={m.menuTitle}>Transcription Engine</Text>
            {([
              { id: 'Voxtral Mini' as MicModel, sub: 'Mistral · transcribe-2' },
              { id: 'Soniox' as MicModel, sub: 'Latest model · medical' },
            ]).map(({ id, sub }) => (
              <TouchableOpacity
                key={id}
                style={[m.menuRow, micModel === id && m.menuRowActive]}
                onPress={() => { setMicModel(id); setShowModelPicker(false); }}
              >
                <View>
                  <Text style={[m.menuRowText, micModel === id && m.menuRowTextActive]}>{id}</Text>
                  <Text style={m.menuRowSub}>{sub}</Text>
                </View>
                {micModel === id && <Ionicons name="checkmark" size={16} color={colors.primaryLight} />}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const m = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.overlay },
  menu: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, width: 230, overflow: 'hidden', ...shadows.md },
  menuTitle: { fontSize: typography.xs, color: colors.textMuted, fontWeight: typography.bold, textTransform: 'uppercase', letterSpacing: 1, padding: spacing[4], paddingBottom: spacing[2] },
  menuRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing[4], borderTopWidth: 1, borderTopColor: colors.border },
  menuRowActive: { backgroundColor: colors.primarySoft },
  menuRowText: { fontSize: typography.base, color: colors.textSecondary },
  menuRowTextActive: { color: colors.primaryLight, fontWeight: typography.semibold },
  menuRowSub: { fontSize: typography.xs, color: colors.textMuted, marginTop: 1 },
});

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing[5], paddingTop: spacing[2], paddingBottom: spacing[2] },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  logoMark: { width: 26, height: 26, borderRadius: radius.sm, backgroundColor: colors.primarySoft, borderWidth: 1, borderColor: 'rgba(96,165,250,0.18)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: typography.sm, fontWeight: typography.bold, color: colors.text },
  headerSub: { fontSize: 10, color: colors.textMuted },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  creditPill: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: colors.warningSoft, paddingHorizontal: spacing[2], paddingVertical: 4, borderRadius: radius.full, borderWidth: 1, borderColor: 'rgba(251,191,36,0.20)' },
  creditText: { fontSize: typography.xs, fontWeight: typography.bold, color: colors.warningLight },
  iconBtn: { width: 28, height: 28, borderRadius: radius.sm, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 26, height: 26, borderRadius: 13, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 10, fontWeight: typography.bold, color: colors.white },

  // Stats — single compact strip instead of tall pills
  statsRow: { flexDirection: 'row', paddingHorizontal: spacing[5], paddingBottom: spacing[2], gap: spacing[2] },
  statPill: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, height: 28, backgroundColor: colors.surface, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border },
  statValue: { fontSize: typography.xs, fontWeight: typography.bold },
  statLabel: { fontSize: 10, color: colors.textMuted },

  // Inner tab bar — tighter
  tabBar: { flexDirection: 'row', marginHorizontal: spacing[5], marginBottom: spacing[2], backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: 3 },
  tabItem: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 7, borderRadius: radius.sm },
  tabItemActive: { backgroundColor: colors.primarySoft },
  tabLabel: { fontSize: typography.xs, fontWeight: typography.semibold, color: colors.textMuted },
  tabLabelActive: { color: colors.primaryLight },

  // Content area
  content: { flex: 1 },
  tabContent: { paddingHorizontal: spacing[4], paddingBottom: spacing[10] },

  // Template tab
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[2], backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing[3], height: 38, marginBottom: spacing[3] },
  searchInput: { flex: 1, color: colors.text, fontSize: typography.sm },
  sectionBlock: { marginBottom: spacing[3] },
  sectionLabel: { flexDirection: 'row', alignItems: 'center', gap: spacing[2], marginBottom: spacing[2] },
  sectionLabelText: { fontSize: 10, fontWeight: typography.bold, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 },
  macroHint: { flexDirection: 'row', alignItems: 'center', gap: spacing[2], backgroundColor: colors.primarySoft, borderRadius: radius.sm, borderWidth: 1, borderColor: 'rgba(96,165,250,0.15)', paddingHorizontal: spacing[3], paddingVertical: spacing[2], marginTop: spacing[1] },
  macroHintText: { flex: 1, fontSize: 10, color: colors.textSecondary },
  macroHintHighlight: { color: colors.primaryLight, fontWeight: typography.semibold },

  // Dictate tab
  dictateTab: { flex: 1 },
  micHero: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing[4], paddingHorizontal: spacing[8] },
  micHeroTitle: { fontSize: typography.xl, fontWeight: typography.bold, color: colors.text },
  micHeroSub: { fontSize: typography.sm, color: colors.textMuted, textAlign: 'center', lineHeight: typography.sm * 1.6 },
  templateBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[2], backgroundColor: colors.primarySoft, borderRadius: radius.full, borderWidth: 1, borderColor: 'rgba(96,165,250,0.20)', paddingHorizontal: spacing[4], paddingVertical: 8, maxWidth: '90%' },
  templateBadgeText: { flex: 1, fontSize: typography.sm, color: colors.primaryLight, fontWeight: typography.medium },
  recordingHero: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing[4] },
  recTime: { fontSize: typography.xl, fontWeight: typography.bold, color: colors.mic, letterSpacing: 2 },
  recLabel: { fontSize: typography.sm, color: colors.errorLight },
  transcribingHero: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing[3] },
  transcribingIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.primarySoft, borderWidth: 1, borderColor: 'rgba(96,165,250,0.20)', alignItems: 'center', justifyContent: 'center' },
  transcribingTitle: { fontSize: typography.lg, fontWeight: typography.bold, color: colors.text },
  transcribingSub: { fontSize: typography.sm, color: colors.textMuted },
  findingsArea: { flex: 1, paddingHorizontal: spacing[5], paddingTop: spacing[3], gap: spacing[3] },
  macroPanel: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: 'rgba(251,191,36,0.15)', padding: spacing[4] },
  textareaCard: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  textarea: { flex: 1, fontSize: typography.sm, color: colors.text, lineHeight: typography.sm * 1.7, padding: spacing[4], minHeight: 120 },
  textareaToolbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing[4], paddingVertical: spacing[3], borderTopWidth: 1, borderTopColor: colors.border },
  refineBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.primarySoft, borderRadius: radius.full, borderWidth: 1, borderColor: 'rgba(96,165,250,0.20)', paddingHorizontal: spacing[3], paddingVertical: 6 },
  refineBtnText: { fontSize: typography.xs, color: colors.primaryLight, fontWeight: typography.semibold },
  clearBtn: { width: 30, height: 30, borderRadius: radius.md, backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },

  // Dictate bottom panel
  dictatePanel: { backgroundColor: colors.bgSecondary, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing[4], paddingHorizontal: spacing[5], gap: spacing[3] },
  micRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  modelPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.surface, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing[3], paddingVertical: 7 },
  modelPillText: { fontSize: typography.xs, color: colors.textMuted, fontWeight: typography.medium },
  micRowHint: { fontSize: typography.xs, color: colors.textDisabled, flex: 1, textAlign: 'right' },

  // Generate buttons
  smartGenBtn: { borderRadius: radius.lg, overflow: 'hidden' },
  smartGenGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing[2], paddingVertical: 15 },
  smartGenText: { fontSize: typography.base, fontWeight: typography.bold, color: colors.white },
  useTemplateBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing[2], paddingVertical: 13, borderRadius: radius.lg, borderWidth: 1.5, borderColor: 'rgba(96,165,250,0.30)', backgroundColor: colors.primarySoft },
  useTemplateText: { fontSize: typography.sm, fontWeight: typography.semibold, color: colors.primaryLight, flex: 1, textAlign: 'center' },
  btnDisabled: { opacity: 0.38 },
  btnTextDim: { color: colors.textDisabled },

  // Report tab
  reportTab: { flex: 1 },
  reportThreadHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing[5], paddingVertical: spacing[3], borderBottomWidth: 1, borderBottomColor: colors.border },
  reportThreadMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  reportThreadMetaText: { fontSize: typography.xs, color: colors.textMuted, fontWeight: typography.medium },
  newReportBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: spacing[3], paddingVertical: 7, backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.borderStrong },
  newReportText: { fontSize: typography.xs, fontWeight: typography.semibold, color: colors.text },
  reportThreadContent: { paddingHorizontal: spacing[5], paddingTop: spacing[3], paddingBottom: spacing[4] },

  // Revision request bubble (right-aligned)
  revBubbleWrap: { alignItems: 'flex-end', marginBottom: spacing[4] },
  revBubble: { maxWidth: '82%', backgroundColor: 'rgba(37,99,235,0.12)', borderRadius: radius.lg, borderTopRightRadius: 4, borderWidth: 1, borderColor: 'rgba(96,165,250,0.18)', padding: spacing[4], gap: 6 },
  revBubbleHeader: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  revBubbleLabel: { fontSize: 10, color: colors.primaryLight, fontWeight: typography.semibold },
  revBubbleText: { fontSize: typography.sm, color: colors.text, lineHeight: typography.sm * 1.6 },
  revBubbleTime: { fontSize: 10, color: colors.textDisabled, alignSelf: 'flex-end' },

  // Revising skeleton
  revisingSkeleton: { flexDirection: 'row', alignItems: 'center', gap: spacing[3], marginBottom: spacing[4] },
  revisingAvatar: { width: 30, height: 30, borderRadius: radius.md, backgroundColor: colors.primarySoft, borderWidth: 1, borderColor: 'rgba(96,165,250,0.18)', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  revisingBubble: { flexDirection: 'row', alignItems: 'center', gap: spacing[3], backgroundColor: colors.surface, borderRadius: radius.lg, borderTopLeftRadius: 4, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing[4], paddingVertical: spacing[3] },
  revisingText: { fontSize: typography.sm, color: colors.textMuted, fontWeight: typography.medium },

  // Revision input bar
  revisionBar: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing[2], paddingHorizontal: spacing[4], paddingVertical: spacing[3], paddingBottom: spacing[4], borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.bgSecondary },
  revisionInput: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing[4], paddingVertical: spacing[3], color: colors.text, fontSize: typography.sm, maxHeight: 120, lineHeight: typography.sm * 1.5 },
  revisionSend: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  revisionSendDisabled: { backgroundColor: colors.surfaceAlt },

  reportCard: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', marginBottom: spacing[4] },
  reportCardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing[2], backgroundColor: colors.primarySoft, paddingHorizontal: spacing[5], paddingVertical: spacing[3], borderBottomWidth: 1, borderBottomColor: 'rgba(96,165,250,0.12)' },
  reportCardHeaderText: { fontSize: typography.xs, color: colors.primaryLight, fontWeight: typography.bold, flex: 1 },
  reportCardBody: { padding: spacing[5] },
  reportActions: { flexDirection: 'row', gap: spacing[3], marginBottom: spacing[4], flexWrap: 'wrap' },
  reportActionBtn: { flex: 1, minWidth: 80, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing[2], paddingVertical: 12, backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border },
  reportActionText: { fontSize: typography.xs, fontWeight: typography.semibold, color: colors.primaryLight },
  newReportBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing[2], paddingVertical: 14, borderRadius: radius.lg, borderWidth: 1.5, borderColor: colors.borderStrong, backgroundColor: colors.surface },
  newReportText: { fontSize: typography.base, fontWeight: typography.semibold, color: colors.text },
  reportEmpty: { alignItems: 'center', paddingTop: spacing[16], gap: spacing[4] },
  reportEmptyIcon: { width: 72, height: 72, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  reportEmptyTitle: { fontSize: typography.lg, fontWeight: typography.bold, color: colors.textSecondary },
  reportEmptySub: { fontSize: typography.sm, color: colors.textMuted, textAlign: 'center', lineHeight: typography.sm * 1.6, paddingHorizontal: spacing[4] },
  reportEmptyBtn: { paddingHorizontal: spacing[6], paddingVertical: spacing[3], backgroundColor: colors.primarySoft, borderRadius: radius.lg, borderWidth: 1, borderColor: 'rgba(96,165,250,0.25)' },
  reportEmptyBtnText: { fontSize: typography.sm, fontWeight: typography.semibold, color: colors.primaryLight },
});
