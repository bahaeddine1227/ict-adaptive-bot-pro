import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTrades } from '../context/TradeContext';
import { colors, radius, spacing, typography } from '../theme/colors';
import StatCard from '../components/StatCard';
import Section from '../components/Section';
import EquityCurveChart from '../components/EquityCurveChart';
import { isAfterFridayCutoff } from '../utils/aiCoach';

function fmtMoney(n) {
  const v = Number.isFinite(n) ? n : 0;
  return `${v >= 0 ? '' : '-'}$${Math.abs(v).toFixed(2)}`;
}

export default function DashboardScreen({ navigation }) {
  const { metrics, trades, openTradesCount } = useTrades();
  const fridayCutoff = isAfterFridayCutoff();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.eyebrow}>Overview</Text>
          <Text style={styles.title}>Performance Dashboard</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('AddEditTrade')}
        >
          <Text style={styles.addBtnText}>+ Trade</Text>
        </TouchableOpacity>
      </View>

      {fridayCutoff ? (
        <View style={styles.warningBanner}>
          <Text style={styles.warningText}>
            ⚠ It's past 18:00 on Friday — no new trades per your trading rules.
          </Text>
        </View>
      ) : null}

      {openTradesCount >= 1 ? (
        <View style={styles.infoBanner}>
          <Text style={styles.infoText}>
            You have {openTradesCount} open trade(s). Max 1 open trade at a time.
          </Text>
        </View>
      ) : null}

      <Section title="Equity Curve">
        <View style={styles.chartCard}>
          <EquityCurveChart points={metrics.equityCurve} />
        </View>
      </Section>

      <Section title="Key Metrics">
        <View style={styles.grid}>
          <StatCard label="Total Trades" value={metrics.totalTrades} />
          <StatCard label="Win Rate" value={`${metrics.winRate.toFixed(1)}%`} accent={colors.win} />
          <StatCard
            label="Net P/L"
            value={fmtMoney(metrics.netPnl)}
            accent={metrics.netPnl >= 0 ? colors.win : colors.loss}
          />
          <StatCard label="Profit Factor" value={metrics.profitFactor.toFixed(2)} />
          <StatCard label="Avg RR" value={`1:${metrics.avgRR.toFixed(2)}`} />
          <StatCard label="Avg Quality Score" value={metrics.avgQualityScore.toFixed(1)} />
          <StatCard label="Wins" value={metrics.wins} accent={colors.win} />
          <StatCard label="Losses" value={metrics.losses} accent={colors.loss} />
        </View>
      </Section>

      <Section title="Best & Worst">
        <View style={styles.grid}>
          <StatCard label="Best Pair" value={metrics.bestPair || '—'} accent={colors.win} />
          <StatCard label="Worst Pair" value={metrics.worstPair || '—'} accent={colors.loss} />
          <StatCard label="Best Session" value={metrics.bestSession || '—'} />
          <StatCard label="Best Setup" value={metrics.bestSetup || '—'} />
        </View>
      </Section>

      <Section title="Streaks & Time Windows">
        <View style={styles.grid}>
          <StatCard label="Winning Streak" value={metrics.winningStreak} accent={colors.win} />
          <StatCard label="Losing Streak" value={metrics.losingStreak} accent={colors.loss} />
          <StatCard
            label="Weekly Profit"
            value={fmtMoney(metrics.weeklyProfit)}
            accent={metrics.weeklyProfit >= 0 ? colors.win : colors.loss}
          />
          <StatCard
            label="Monthly Profit"
            value={fmtMoney(metrics.monthlyProfit)}
            accent={metrics.monthlyProfit >= 0 ? colors.win : colors.loss}
          />
        </View>
      </Section>

      {trades.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No trades yet</Text>
          <Text style={styles.emptyBody}>
            Log your first trade to start tracking performance, or run the Pre-Trade Checklist
            before entering the market.
          </Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl * 2 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: spacing.lg,
  },
  eyebrow: { ...typography.eyebrow, color: colors.textMuted },
  title: { ...typography.h1, color: colors.textPrimary, marginTop: 2 },
  addBtn: {
    backgroundColor: colors.gold,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  addBtnText: { color: colors.background, fontWeight: '700' },
  warningBanner: {
    backgroundColor: '#3A2A12',
    borderWidth: 1,
    borderColor: colors.warning,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  warningText: { color: colors.warning, ...typography.small, fontWeight: '600' },
  infoBanner: {
    backgroundColor: '#122232',
    borderWidth: 1,
    borderColor: colors.info,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  infoText: { color: colors.info, ...typography.small, fontWeight: '600' },
  chartCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.sm },
  emptyBody: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
