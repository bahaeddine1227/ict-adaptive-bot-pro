import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTrades } from '../context/TradeContext';
import { colors, radius, spacing, typography } from '../theme/colors';
import Section from '../components/Section';
import CalendarHeatmap from '../components/CalendarHeatmap';
import { performanceBy, monthlyReport, dailyPnlMap } from '../utils/calculations';

function PerformanceTable({ rows, keyLabel }) {
  if (!rows.length) {
    return <Text style={styles.emptyText}>Not enough data yet.</Text>;
  }
  return (
    <View style={styles.table}>
      <View style={styles.tableHeaderRow}>
        <Text style={[styles.th, { flex: 1.4 }]}>{keyLabel}</Text>
        <Text style={styles.th}>Trades</Text>
        <Text style={styles.th}>Win%</Text>
        <Text style={styles.th}>Avg RR</Text>
        <Text style={[styles.th, { flex: 1.2 }]}>Net P/L</Text>
      </View>
      {rows.map((r) => (
        <View key={r.key} style={styles.tableRow}>
          <Text style={[styles.td, { flex: 1.4, color: colors.textPrimary, fontWeight: '600' }]}>
            {r.key}
          </Text>
          <Text style={styles.td}>{r.trades}</Text>
          <Text style={styles.td}>{r.winRate.toFixed(0)}%</Text>
          <Text style={styles.td}>1:{r.avgRR.toFixed(1)}</Text>
          <Text
            style={[
              styles.td,
              { flex: 1.2, color: r.netPnl >= 0 ? colors.win : colors.loss, fontWeight: '700' },
            ]}
          >
            {r.netPnl >= 0 ? '+' : ''}${r.netPnl.toFixed(2)}
          </Text>
        </View>
      ))}
    </View>
  );
}

export default function AnalyticsScreen() {
  const { trades } = useTrades();

  const bySetup = useMemo(() => performanceBy(trades, (t) => t.setupType), [trades]);
  const bySession = useMemo(() => performanceBy(trades, (t) => t.session), [trades]);
  const byPair = useMemo(() => performanceBy(trades, (t) => t.pair), [trades]);
  const monthly = useMemo(() => monthlyReport(trades), [trades]);
  const dailyMap = useMemo(() => dailyPnlMap(trades), [trades]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>Deep Dive</Text>
      <Text style={styles.title}>Analytics</Text>

      <Section title="Calendar Heatmap">
        <View style={styles.card}>
          <CalendarHeatmap dailyPnlMap={dailyMap} />
        </View>
      </Section>

      <Section title="Setup Performance (Win Rate & Avg RR by Setup)">
        <View style={styles.card}>
          <PerformanceTable rows={bySetup} keyLabel="Setup" />
        </View>
      </Section>

      <Section title="Session Performance">
        <View style={styles.card}>
          <PerformanceTable rows={bySession} keyLabel="Session" />
        </View>
      </Section>

      <Section title="Pair Performance">
        <View style={styles.card}>
          <PerformanceTable rows={byPair} keyLabel="Pair" />
        </View>
      </Section>

      <Section title="Monthly Report">
        <View style={styles.card}>
          {monthly.length === 0 ? (
            <Text style={styles.emptyText}>Not enough data yet.</Text>
          ) : (
            monthly.map((m) => (
              <View key={m.month} style={styles.monthRow}>
                <Text style={styles.monthLabel}>{m.month}</Text>
                <Text style={styles.monthTrades}>{m.trades} trades</Text>
                <Text style={styles.monthWinrate}>{m.winRate.toFixed(0)}% WR</Text>
                <Text
                  style={[
                    styles.monthPnl,
                    { color: m.netPnl >= 0 ? colors.win : colors.loss },
                  ]}
                >
                  {m.netPnl >= 0 ? '+' : ''}${m.netPnl.toFixed(2)}
                </Text>
              </View>
            ))
          )}
        </View>
      </Section>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl * 2 },
  eyebrow: { ...typography.eyebrow, color: colors.textMuted },
  title: { ...typography.h1, color: colors.textPrimary, marginTop: 2, marginBottom: spacing.lg },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  table: {},
  tableHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.sm,
    marginBottom: spacing.sm,
  },
  th: {
    flex: 1,
    ...typography.eyebrow,
    fontSize: 10,
    color: colors.textMuted,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  td: {
    flex: 1,
    ...typography.small,
    color: colors.textSecondary,
  },
  emptyText: { ...typography.body, color: colors.textMuted, textAlign: 'center', padding: spacing.md },
  monthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  monthLabel: { ...typography.body, color: colors.textPrimary, fontWeight: '600' },
  monthTrades: { ...typography.small, color: colors.textMuted },
  monthWinrate: { ...typography.small, color: colors.textSecondary },
  monthPnl: { ...typography.mono, fontWeight: '700' },
});
