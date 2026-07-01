import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { useTrades } from '../context/TradeContext';
import { colors, radius, spacing, typography } from '../theme/colors';
import TradeListItem from '../components/TradeListItem';
import { RESULTS } from '../utils/constants';

export default function JournalScreen({ navigation }) {
  const { trades } = useTrades();
  const [query, setQuery] = useState('');
  const [resultFilter, setResultFilter] = useState('All');

  const filtered = useMemo(() => {
    return trades.filter((t) => {
      const matchesQuery =
        !query ||
        t.pair?.toLowerCase().includes(query.toLowerCase()) ||
        t.setupType?.toLowerCase().includes(query.toLowerCase()) ||
        t.notes?.toLowerCase().includes(query.toLowerCase());
      const matchesResult = resultFilter === 'All' || t.result === resultFilter;
      return matchesQuery && matchesResult;
    });
  }, [trades, query, resultFilter]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TextInput
          style={styles.search}
          placeholder="Search pair, setup, notes..."
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={setQuery}
        />
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('AddEditTrade')}
        >
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterRow}>
        {['All', ...RESULTS].map((r) => {
          const active = r === resultFilter;
          return (
            <TouchableOpacity
              key={r}
              style={[styles.filterChip, active && styles.filterChipActive]}
              onPress={() => setResultFilter(r)}
            >
              <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                {r}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TradeListItem
            trade={item}
            onPress={() => navigation.navigate('AddEditTrade', { tradeId: item.id })}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              {trades.length === 0
                ? 'No trades logged yet. Tap + to add your first trade.'
                : 'No trades match your search/filter.'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  search: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    color: colors.textPrimary,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: { color: colors.background, fontSize: 22, fontWeight: '700', lineHeight: 24 },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: { backgroundColor: colors.gold, borderColor: colors.gold },
  filterChipText: { ...typography.small, color: colors.textSecondary, fontWeight: '600' },
  filterChipTextActive: { color: colors.background },
  list: { paddingBottom: spacing.xxl * 2 },
  empty: { alignItems: 'center', marginTop: spacing.xxl },
  emptyText: { ...typography.body, color: colors.textMuted, textAlign: 'center' },
});
