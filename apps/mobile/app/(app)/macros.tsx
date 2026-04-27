import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, Switch, Modal, Pressable, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MOCK_MACROS, MOCK_SPECIALITIES, type Macro } from '../../src/stores/appStore';
import { colors, typography, spacing, radius } from '../../src/theme';

export default function MacrosScreen() {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [showMine, setShowMine] = useState(true);
  const [macros, setMacros] = useState(MOCK_MACROS);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newSpeciality, setNewSpeciality] = useState('1');

  const filtered = macros.filter((m) => {
    if (search && !m.name.toLowerCase().includes(search.toLowerCase()) && !m.description.toLowerCase().includes(search.toLowerCase())) return false;
    if (showMine && m.isPublic) return false;
    return true;
  });

  function toggleActive(id: string) {
    setMacros((prev) => prev.map((m) => m.id === id ? { ...m, isActive: !m.isActive } : m));
  }

  function handleCreate() {
    if (!newName.trim() || !newDesc.trim()) return;
    const newMacro: Macro = {
      id: 'm' + Date.now(), name: newName.trim().toLowerCase(),
      description: newDesc.trim(), isActive: true, isPublic: false,
      specialityId: newSpeciality,
    };
    setMacros((prev) => [newMacro, ...prev]);
    setNewName(''); setNewDesc(''); setShowCreate(false);
  }

  const specName = (id?: string) => MOCK_SPECIALITIES.find((s) => s.id === id)?.name ?? 'General';

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.title}>Macros</Text>
          <Text style={s.subtitle}>{macros.filter((m) => m.isActive).length} active · {macros.length} total</Text>
        </View>
        <TouchableOpacity style={s.addBtn} onPress={() => setShowCreate(true)}>
          <Ionicons name="add" size={22} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* Info banner */}
      <View style={s.infoBanner}>
        <Ionicons name="information-circle-outline" size={16} color={colors.primaryLight} />
        <Text style={s.infoText}>
          Type <Text style={s.infoHighlight}>"insert [macro name]"</Text> in the findings input to auto-expand a macro.
        </Text>
      </View>

      {/* Search + toggle */}
      <View style={s.toolbar}>
        <View style={s.searchBox}>
          <Ionicons name="search-outline" size={17} color={colors.textMuted} />
          <TextInput
            value={search} onChangeText={setSearch}
            placeholder="Search macros…" placeholderTextColor={colors.textDisabled}
            style={s.searchInput}
          />
        </View>
        <TouchableOpacity
          style={[s.toggleBtn, !showMine && s.toggleBtnActive]}
          onPress={() => setShowMine((v) => !v)}
        >
          <Ionicons name="earth-outline" size={16} color={showMine ? colors.textMuted : colors.primaryLight} />
          <Text style={[s.toggleText, !showMine && s.toggleTextActive]}>Public</Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(m) => m.id}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item: m }) => (
          <View style={[s.card, !m.isActive && s.cardInactive]}>
            {/* Header row */}
            <TouchableOpacity
              style={s.cardHeader}
              onPress={() => setExpanded(expanded === m.id ? null : m.id)}
              activeOpacity={0.8}
            >
              <View style={[s.macroIcon, !m.isActive && s.macroIconInactive]}>
                <Ionicons name="bookmark-outline" size={16} color={m.isActive ? colors.warningLight : colors.textDisabled} />
              </View>
              <View style={s.cardInfo}>
                <Text style={[s.macroName, !m.isActive && s.macroNameInactive]}>insert {m.name}</Text>
                <View style={s.cardMeta}>
                  <Text style={s.cardSpec}>{specName(m.specialityId)}</Text>
                  {m.isPublic && <Ionicons name="earth-outline" size={11} color={colors.primaryLight} />}
                </View>
              </View>
              <Switch
                value={m.isActive}
                onValueChange={() => toggleActive(m.id)}
                trackColor={{ false: colors.surfaceHover, true: colors.warning + '70' }}
                thumbColor={m.isActive ? colors.warningLight : colors.textMuted}
              />
            </TouchableOpacity>

            {/* Expanded preview */}
            {expanded === m.id && (
              <View style={s.cardBody}>
                <Text style={s.cardPreview}>{m.description}</Text>
                <View style={s.cardActions}>
                  <TouchableOpacity style={s.cardBtn}>
                    <Ionicons name="pencil-outline" size={14} color={colors.primaryLight} />
                    <Text style={s.cardBtnText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={s.cardBtn}>
                    <Ionicons name="copy-outline" size={14} color={colors.primaryLight} />
                    <Text style={s.cardBtnText}>Clone</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[s.cardBtn, s.cardBtnDanger]}>
                    <Ionicons name="trash-outline" size={14} color={colors.errorLight} />
                    <Text style={[s.cardBtnText, { color: colors.errorLight }]}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}
        ListEmptyComponent={
          <View style={s.empty}>
            <Ionicons name="bookmark-outline" size={44} color={colors.textDisabled} />
            <Text style={s.emptyText}>No macros found</Text>
            <TouchableOpacity style={s.emptyBtn} onPress={() => setShowCreate(true)}>
              <Text style={s.emptyBtnText}>Create your first macro</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Create modal */}
      <Modal visible={showCreate} transparent animationType="slide">
        <View style={modal.overlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowCreate(false)} />
          <View style={[modal.sheet, { paddingBottom: insets.bottom + spacing[4] }]}>
            <View style={modal.handle} />
            <Text style={modal.title}>New Macro</Text>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <View style={modal.form}>
                <View style={modal.field}>
                  <Text style={modal.label}>Macro Name <Text style={modal.required}>*</Text></Text>
                  <TextInput
                    value={newName} onChangeText={setNewName}
                    placeholder="e.g. normal chest"
                    placeholderTextColor={colors.textDisabled}
                    style={modal.input} autoCapitalize="none"
                  />
                  <Text style={modal.hint}>Users type "insert {newName || 'name'}" to expand this</Text>
                </View>
                <View style={modal.field}>
                  <Text style={modal.label}>Expansion Text <Text style={modal.required}>*</Text></Text>
                  <TextInput
                    value={newDesc} onChangeText={setNewDesc}
                    placeholder="Full clinical text to insert…"
                    placeholderTextColor={colors.textDisabled}
                    style={[modal.input, modal.textarea]}
                    multiline numberOfLines={4} textAlignVertical="top"
                  />
                </View>
                <View style={modal.field}>
                  <Text style={modal.label}>Speciality</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: spacing[2] }}>
                    <View style={{ flexDirection: 'row', gap: spacing[2] }}>
                      {MOCK_SPECIALITIES.slice(0, 6).map((sp) => (
                        <TouchableOpacity
                          key={sp.id}
                          style={[modal.specChip, newSpeciality === sp.id && modal.specChipActive]}
                          onPress={() => setNewSpeciality(sp.id)}
                        >
                          <Text style={modal.specEmoji}>{sp.icon}</Text>
                          <Text style={[modal.specText, newSpeciality === sp.id && modal.specTextActive]}>
                            {sp.name.split(' ')[0]}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              </View>
            </ScrollView>
            <TouchableOpacity
              style={[modal.createBtn, (!newName || !newDesc) && modal.createBtnDisabled]}
              onPress={handleCreate}
              disabled={!newName || !newDesc}
            >
              <Ionicons name="add-circle-outline" size={18} color={colors.white} />
              <Text style={modal.createBtnText}>Create Macro</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const modal = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: colors.overlay },
  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, borderTopWidth: 1, borderColor: colors.border, padding: spacing[5], gap: spacing[4] },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.borderLight, alignSelf: 'center', marginBottom: spacing[2] },
  title: { fontSize: typography.lg, fontWeight: typography.bold, color: colors.text },
  form: { gap: spacing[4] },
  field: { gap: spacing[2] },
  label: { fontSize: typography.sm, fontWeight: typography.medium, color: colors.textSecondary },
  required: { color: colors.errorLight },
  hint: { fontSize: typography.xs, color: colors.textMuted },
  input: { backgroundColor: colors.bgSecondary, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, paddingHorizontal: spacing[4], paddingVertical: spacing[3], color: colors.text, fontSize: typography.base },
  textarea: { minHeight: 90, paddingTop: spacing[3] },
  specChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: spacing[3], paddingVertical: spacing[2], backgroundColor: colors.surfaceAlt, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border },
  specChipActive: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  specEmoji: { fontSize: 13 },
  specText: { fontSize: typography.sm, color: colors.textMuted },
  specTextActive: { color: colors.primaryLight, fontWeight: typography.semibold },
  createBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing[2], backgroundColor: colors.primary, borderRadius: radius.lg, padding: spacing[4] },
  createBtnDisabled: { opacity: 0.45 },
  createBtnText: { fontSize: typography.base, fontWeight: typography.semibold, color: colors.white },
});

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing[5], paddingVertical: spacing[3] },
  title: { fontSize: typography.xl, fontWeight: typography.bold, color: colors.text },
  subtitle: { fontSize: typography.xs, color: colors.textMuted, marginTop: 1 },
  addBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  infoBanner: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing[3], marginHorizontal: spacing[5], marginBottom: spacing[3], backgroundColor: colors.primarySoft, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.primary + '30', padding: spacing[4] },
  infoText: { flex: 1, fontSize: typography.sm, color: colors.textSecondary, lineHeight: typography.sm * 1.5 },
  infoHighlight: { color: colors.primaryLight, fontWeight: typography.semibold },
  toolbar: { flexDirection: 'row', gap: spacing[3], paddingHorizontal: spacing[5], marginBottom: spacing[3] },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing[2], backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, paddingHorizontal: spacing[4], height: 46 },
  searchInput: { flex: 1, color: colors.text, fontSize: typography.base },
  toggleBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: spacing[3], borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  toggleBtnActive: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  toggleText: { fontSize: typography.sm, color: colors.textMuted },
  toggleTextActive: { color: colors.primaryLight, fontWeight: typography.semibold },
  list: { paddingHorizontal: spacing[5], paddingBottom: spacing[20] },
  card: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, marginBottom: 6, overflow: 'hidden' },
  cardInactive: { opacity: 0.55 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing[3], paddingHorizontal: spacing[4], paddingVertical: spacing[3] },
  macroIcon: { width: 32, height: 32, borderRadius: radius.sm, backgroundColor: colors.warningSoft, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  macroIconInactive: { backgroundColor: colors.surfaceAlt },
  cardInfo: { flex: 1, gap: 3 },
  macroName: { fontSize: typography.base, fontWeight: typography.semibold, color: colors.text, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  macroNameInactive: { color: colors.textMuted },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  cardSpec: { fontSize: typography.xs, color: colors.textMuted },
  cardBody: { borderTopWidth: 1, borderTopColor: colors.border, padding: spacing[4], gap: spacing[3] },
  cardPreview: { fontSize: typography.sm, color: colors.textSecondary, lineHeight: typography.sm * 1.6 },
  cardActions: { flexDirection: 'row', gap: spacing[2] },
  cardBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: spacing[3], paddingVertical: spacing[2], backgroundColor: colors.primarySoft, borderRadius: radius.full, borderWidth: 1, borderColor: colors.primary + '30' },
  cardBtnDanger: { backgroundColor: colors.errorSoft, borderColor: colors.error + '30' },
  cardBtnText: { fontSize: typography.xs, color: colors.primaryLight, fontWeight: typography.medium },
  empty: { alignItems: 'center', paddingTop: spacing[16], gap: spacing[3] },
  emptyText: { fontSize: typography.base, color: colors.textDisabled },
  emptyBtn: { paddingHorizontal: spacing[5], paddingVertical: spacing[3], backgroundColor: colors.primarySoft, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.primary + '40' },
  emptyBtnText: { fontSize: typography.sm, color: colors.primaryLight, fontWeight: typography.semibold },
});

import { Platform } from 'react-native';
