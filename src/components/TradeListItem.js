import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { colors, radius, spacing, typography } from '../theme/colors';
import { ResultBadge, DirectionBadge } from './ScoreBadge';

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) +
    ' · ' +
    d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

export default function TradeListItem({ trade, onPress }) {
  const pnl = parseFloat(trade.pnlDollars) || 0;
  const pnlColor = pnl > 0 ? colors.win : pnl < 0 ? colors.loss : colors.textSecondary;

  return (
    <TouchableOpacity activeOpacity={0.75} style={styles.card} onPress={onPress}>
      <View style={styles.row}>
        <View style={styles.left}>
          <Text style={styles.pair}>{trade.pair || 'Unnamed pair'}</Text>
          <Text style={styles.meta}>{formatDate(trade.dateTime)}</Text>
          <View style={styles.badgeRow}>
            <DirectionBadge direction={trade.direction} />
            <ResultBadge result={trade.result} />
          </View>
        </View>
        {trade.screenshotUri ? (
          <Image source={{ uri: trade.screenshotUri }} style={styles.thumb} />
        ) : (
          <View style={styles.thumbPlaceholder}>
            <Text style={styles.thumbPlaceholderText}>{trade.setupType}</Text>
          </View>
        )}
      </View>
      <View style={styles.footer}>
        <Text style={styles.footerLabel}>Session: {trade.session}</Text>
        <Text style={styles.footerLabel}>RR 1:{trade.riskRewardRatio || '-'}</Text>
        <Text style={[styles.pnl, { color: pnlColor }]}>
          {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  left: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  pair: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  meta: {
    ...typography.small,
    color: colors.textMuted,
    marginTop: 2,
    marginBottom: spacing.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  thumbPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  thumbPlaceholderText: {
    ...typography.small,
    color: colors.goldDim,
    textAlign: 'center',
    fontSize: 9,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerLabel: {
    ...typography.small,
    color: colors.textSecondary,
  },
  pnl: {
    ...typography.mono,
    fontWeight: '700',
  },
});
