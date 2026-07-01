import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, radius, spacing, typography } from '../theme/colors';

export default function ChecklistItem({ label, checked, onToggle, required }) {
  return (
    <TouchableOpacity style={styles.row} activeOpacity={0.7} onPress={onToggle}>
      <View style={[styles.box, checked && styles.boxChecked]}>
        {checked ? <Text style={styles.check}>✓</Text> : null}
      </View>
      <Text style={[styles.label, checked && styles.labelChecked]}>{label}</Text>
      {required ? <Text style={styles.required}>required</Text> : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  box: {
    width: 24,
    height: 24,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  boxChecked: {
    backgroundColor: colors.gold,
    borderColor: colors.gold,
  },
  check: {
    color: colors.background,
    fontWeight: '900',
    fontSize: 14,
  },
  label: {
    ...typography.body,
    color: colors.textSecondary,
    flex: 1,
  },
  labelChecked: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  required: {
    ...typography.small,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
});
