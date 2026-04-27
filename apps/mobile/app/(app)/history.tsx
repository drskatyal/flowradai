import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ReportCard } from '../../src/components/ReportCard';
import { StatsRow } from '../../src/components/StatsRow';
import { MOCK_REPORTS } from '../../src/stores/appStore';
import { colors, typography, spacing, radius } from '../../src/theme';

type DateFilter = 'today' | 'week' | 'month' | 'all';

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'normal' | 'abnormal'>('all');

  const filtered = MOCK_REPORTS.filter((r) => {
    if (search && !r.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (categoryFilter !== 'all' && r.category !== categoryFilter) return false;
    return true;
  });

  const DATE_FILTERS: { key: DateFilter; label: string }[] = [
    { key: 'today', label: 'Today' },
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'Month' },
    { key: 'all', label: 'All Time' },
  ];

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Report History</Text>
          <Text style={styles.subtitle}>{MOCK_REPORTS.length} total reports</Text>
        </View>
        <TouchableOpacity style={styles.exportBtn}>
          <Ionicons name="share-outline" size={18} color={colors.primaryLight} />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsWrap}>
        <StatsRow
          stats={[
            { label: 'Total Reports', value: 247, icon: 'document-text-outline', color: colors.primaryLight },
            { label: 'Normal', value: 183, icon: 'checkmark-circle-outline', color: colors.successLight },
            { label: 'Abnormal', value: 64, icon: 'alert-circle-outline', color: colors.warningLight },
          ]}
        />
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color={colors.textMuted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search reports…"
            placeholderTextColor={colors.textDisabled}
            style={styles.searchInput}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>
        <TouchableOpacity style={styles.filterBtn}>
          <Ionicons name="options-outline" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Date filter */}
      <View style={styles.filterRow}>
        {DATE_FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.chip, dateFilter === f.key && styles.chipActive]}
            onPress={() => setDateFilter(f.key)}
          >
            <Text style={[styles.chipText, dateFilter === f.key && styles.chipTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Category toggle */}
      <View style={styles.catRow}>
        {(['all', 'normal', 'abnormal'] as const).map((c) => (
          <TouchableOpacity
            key={c}
            style={[
              styles.catBtn,
              categoryFilter === c && styles.catBtnActive,
              c === 'normal' && categoryFilter === c && styles.catBtnNormal,
              c === 'abnormal' && categoryFilter === c && styles.catBtnAbnormal,
            ]}
            onPress={() => setCategoryFilter(c)}
          >
            {c !== 'all' && (
              <View style={[styles.catDot, c === 'normal' ? styles.catDotNormal : styles.catDotAbnormal]} />
            )}
            <Text style={[styles.catText, categoryFilter === c && styles.catTextActive]}>
              {c === 'all' ? 'All' : c.charAt(0).toUpperCase() + c.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(r) => r.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <ReportCard report={item} onPress={() => router.push(`/report/${item.id}`)} />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="document-outline" size={48} color={colors.textDisabled} />
            <Text style={styles.emptyText}>No reports found</Text>
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
  exportBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsWrap: { paddingHorizontal: spacing[5], marginBottom: spacing[4] },
  searchRow: {
    flexDirection: 'row',
    gap: spacing[3],
    paddingHorizontal: spacing[5],
    marginBottom: spacing[3],
  },
  searchBox: {
    flex: 1,
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
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing[2],
    paddingHorizontal: spacing[5],
    marginBottom: spacing[3],
  },
  chip: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  chipText: { fontSize: typography.xs, color: colors.textMuted },
  chipTextActive: { color: colors.primaryLight, fontWeight: typography.semibold },
  catRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing[5],
    marginBottom: spacing[4],
    gap: spacing[2],
  },
  catBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing[3],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  catBtnActive: { borderColor: colors.primary },
  catBtnNormal: { backgroundColor: colors.successSoft, borderColor: colors.success },
  catBtnAbnormal: { backgroundColor: colors.warningSoft, borderColor: colors.warning },
  catDot: { width: 8, height: 8, borderRadius: 4 },
  catDotNormal: { backgroundColor: colors.successLight },
  catDotAbnormal: { backgroundColor: colors.warningLight },
  catText: { fontSize: typography.sm, color: colors.textSecondary, fontWeight: typography.medium },
  catTextActive: { color: colors.text },
  list: { paddingHorizontal: spacing[5], paddingBottom: spacing[20] },
  empty: { alignItems: 'center', paddingTop: spacing[16], gap: spacing[3] },
  emptyText: { fontSize: typography.base, color: colors.textDisabled },
});
