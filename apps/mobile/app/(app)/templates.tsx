import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TemplateCard } from '../../src/components/TemplateCard';
import { Badge } from '../../src/components/ui/Badge';
import { useAppStore, MOCK_TEMPLATES, MOCK_SPECIALITIES } from '../../src/stores/appStore';
import { colors, typography, spacing, radius } from '../../src/theme';

type Filter = 'all' | 'normal' | 'abnormal' | 'private';

export default function TemplatesScreen() {
  const insets = useSafeAreaInsets();
  const selectedTemplateId = useAppStore((s) => s.selectedTemplateId);
  const setSelectedTemplate = useAppStore((s) => s.setSelectedTemplate);

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [specFilter, setSpecFilter] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return MOCK_TEMPLATES.filter((t) => {
      if (search && !t.title.toLowerCase().includes(search.toLowerCase()) && !t.description.toLowerCase().includes(search.toLowerCase())) return false;
      if (filter === 'normal' && t.category !== 'normal') return false;
      if (filter === 'abnormal' && t.category !== 'abnormal') return false;
      if (filter === 'private' && t.type !== 'private') return false;
      if (specFilter && t.specialityId !== specFilter) return false;
      return true;
    });
  }, [search, filter, specFilter]);

  const FILTERS: { key: Filter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'normal', label: 'Normal' },
    { key: 'abnormal', label: 'Abnormal' },
    { key: 'private', label: 'Mine' },
  ];

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Templates</Text>
          <Text style={styles.subtitle}>{MOCK_TEMPLATES.length} templates available</Text>
        </View>
        <TouchableOpacity style={styles.addBtn}>
          <Ionicons name="add" size={22} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color={colors.textMuted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search templates…"
            placeholderTextColor={colors.textDisabled}
            style={styles.searchInput}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Category filters */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Speciality chips */}
      <View style={styles.specRow}>
        <TouchableOpacity
          style={[styles.specChip, !specFilter && styles.specChipActive]}
          onPress={() => setSpecFilter(null)}
        >
          <Text style={[styles.specText, !specFilter && styles.specTextActive]}>All</Text>
        </TouchableOpacity>
        {MOCK_SPECIALITIES.slice(0, 6).map((s) => (
          <TouchableOpacity
            key={s.id}
            style={[styles.specChip, specFilter === s.id && styles.specChipActive]}
            onPress={() => setSpecFilter(s.id === specFilter ? null : s.id)}
          >
            <Text style={styles.specEmoji}>{s.icon}</Text>
            <Text style={[styles.specText, specFilter === s.id && styles.specTextActive]}>
              {s.name.split(' ')[0]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(t) => t.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TemplateCard
            template={item}
            onPress={() =>
              setSelectedTemplate(selectedTemplateId === item.id ? null : item.id)
            }
            selected={selectedTemplateId === item.id}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="document-text-outline" size={48} color={colors.textDisabled} />
            <Text style={styles.emptyText}>No templates match your search</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[4],
  },
  title: { fontSize: typography['2xl'], fontWeight: typography.bold, color: colors.text },
  subtitle: { fontSize: typography.sm, color: colors.textMuted, marginTop: 2 },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchRow: { paddingHorizontal: spacing[5], marginBottom: spacing[3] },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing[4],
    height: 48,
  },
  searchInput: { flex: 1, color: colors.text, fontSize: typography.base },
  filterRow: {
    flexDirection: 'row',
    gap: spacing[2],
    paddingHorizontal: spacing[5],
    marginBottom: spacing[3],
  },
  filterChip: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  filterText: { fontSize: typography.sm, color: colors.textMuted },
  filterTextActive: { color: colors.primaryLight, fontWeight: typography.semibold },
  specRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
    paddingHorizontal: spacing[5],
    marginBottom: spacing[3],
  },
  specChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: radius.full,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  specChipActive: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  specEmoji: { fontSize: 12 },
  specText: { fontSize: typography.xs, color: colors.textMuted },
  specTextActive: { color: colors.primaryLight, fontWeight: typography.semibold },
  list: { paddingHorizontal: spacing[5], paddingBottom: spacing[20] },
  empty: { alignItems: 'center', paddingTop: spacing[16], gap: spacing[3] },
  emptyText: { fontSize: typography.base, color: colors.textDisabled },
});
