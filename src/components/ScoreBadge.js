import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '../theme/colors';

const RESULT_COLORS = {
  Win: colors.win,
  Loss: colors.loss,
  Breakeven: colors.breakeven,
};

export function ResultBadge({ result }) {
  const color = RESULT_COLORS[result] || colors.textMuted;
  return (
    <View style={[styles.badge, { borderColor: color }]}>
      <Text style={[styles.text, { color }]}>{result}</Text>
    </View>
  );
}

export function DirectionBadge({ direction }) {
  const color = direction === 'Buy' ? colors.buy : colors.sell;
  return (
    <View style={[styles.badge, { borderColor: color }]}>
      <Text style={[styles.text, { color }]}>{direction === 'Buy' ? 'BUY' : 'SELL'}</Text>
    </View>
  );
}

export function QualityBadge({ score }) {
  const n = parseFloat(score) || 0;
  const color = n >= 85 ? colors.win : n >= 60 ? colors.warning : colors.loss;
  return (
    <View style={[styles.badge, { borderColor: color }]}>
      <Text style={[styles.text, { color }]}>QS {n || '-'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingVertical: 3,
    paddingHorizontal: spacing.sm,
    alignSelf: 'flex-start',
  },
  text: {
    ...typography.small,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
