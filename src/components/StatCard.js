import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '../theme/colors';

export default function StatCard({ label, value, accent, sublabel, width }) {
  return (
    <View style={[styles.card, width ? { width } : styles.flexCard]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, accent ? { color: accent } : null]} numberOfLines={1}>
        {value}
      </Text>
      {sublabel ? <Text style={styles.sublabel}>{sublabel}</Text> : null}
    </View>
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
  flexCard: {
    flexGrow: 1,
    flexBasis: '47%',
  },
  label: {
    ...typography.eyebrow,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  value: {
    ...typography.h2,
    color: colors.goldBright,
  },
  sublabel: {
    ...typography.small,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
