import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, radius, spacing, typography } from '../theme/colors';

function pad(n) {
  return String(n).padStart(2, '0');
}

function intensity(pnl, maxAbs) {
  if (!pnl || maxAbs === 0) return 0;
  return Math.min(1, Math.abs(pnl) / maxAbs);
}

export default function CalendarHeatmap({ dailyPnlMap }) {
  const [monthOffset, setMonthOffset] = useState(0);

  const { label, weeks, maxAbs } = useMemo(() => {
    const ref = new Date();
    ref.setMonth(ref.getMonth() + monthOffset);
    const year = ref.getFullYear();
    const month = ref.getMonth();
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startWeekday = (firstDay.getDay() + 6) % 7; // Monday = 0

    const cells = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    let maxAbsVal = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const key = `${year}-${pad(month + 1)}-${pad(d)}`;
      const pnl = dailyPnlMap[key] || 0;
      maxAbsVal = Math.max(maxAbsVal, Math.abs(pnl));
      cells.push({ day: d, pnl });
    }
    while (cells.length % 7 !== 0) cells.push(null);

    const weekRows = [];
    for (let i = 0; i < cells.length; i += 7) {
      weekRows.push(cells.slice(i, i + 7));
    }

    return {
      label: ref.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }),
      weeks: weekRows,
      maxAbs: maxAbsVal,
    };
  }, [monthOffset, dailyPnlMap]);

  return (
    <View>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setMonthOffset((m) => m - 1)}>
          <Text style={styles.nav}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.monthLabel}>{label}</Text>
        <TouchableOpacity onPress={() => setMonthOffset((m) => Math.min(0, m + 1))}>
          <Text style={styles.nav}>›</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.weekLabels}>
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <Text key={i} style={styles.weekLabelText}>
            {d}
          </Text>
        ))}
      </View>
      {weeks.map((week, wi) => (
        <View key={wi} style={styles.weekRow}>
          {week.map((cell, ci) => {
            if (!cell) return <View key={ci} style={styles.cell} />;
            const win = cell.pnl > 0;
            const loss = cell.pnl < 0;
            const alpha = 0.15 + intensity(cell.pnl, maxAbs) * 0.75;
            const bg = win
              ? `rgba(47,191,113,${alpha})`
              : loss
              ? `rgba(229,72,77,${alpha})`
              : colors.surface;
            return (
              <View key={ci} style={[styles.cell, { backgroundColor: bg }]}>
                <Text style={styles.cellDay}>{cell.day}</Text>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    marginBottom: spacing.sm,
  },
  nav: {
    color: colors.gold,
    fontSize: 22,
    paddingHorizontal: spacing.md,
  },
  monthLabel: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  weekLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  weekLabelText: {
    ...typography.small,
    color: colors.textMuted,
    width: 36,
    textAlign: 'center',
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  cell: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellDay: {
    ...typography.small,
    color: colors.textSecondary,
    fontSize: 10,
  },
});
