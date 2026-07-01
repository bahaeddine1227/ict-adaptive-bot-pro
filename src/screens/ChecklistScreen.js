import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors, radius, spacing, typography } from '../theme/colors';
import ChecklistItem from '../components/ChecklistItem';
import { TextField, ChipSelector } from '../components/FormField';
import { LONG_CHECKLIST, SHORT_CHECKLIST, MIN_RR, MIN_QUALITY_SCORE, TRADING_RULES } from '../utils/constants';
import { evaluateChecklist, isAfterFridayCutoff } from '../utils/aiCoach';
import Section from '../components/Section';

export default function ChecklistScreen({ navigation }) {
  const [direction, setDirection] = useState('Long');
  const [checked, setChecked] = useState({});
  const [rr, setRr] = useState('');
  const [quality, setQuality] = useState('');

  const items = direction === 'Long' ? LONG_CHECKLIST : SHORT_CHECKLIST;

  const evaluation = useMemo(
    () => evaluateChecklist(direction, items, checked, rr, quality),
    [direction, items, checked, rr, quality]
  );

  const fridayCutoff = isAfterFridayCutoff();

  const toggle = (key) => setChecked((c) => ({ ...c, [key]: !c[key] }));

  const reset = () => {
    setChecked({});
    setRr('');
    setQuality('');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>Confluence Gate</Text>
      <Text style={styles.title}>Pre-Trade Checklist</Text>

      <ChipSelector
        label="Setup Direction"
        options={['Long', 'Short']}
        value={direction}
        onChange={(v) => {
          setDirection(v);
          setChecked({});
        }}
      />

      {fridayCutoff ? (
        <View style={styles.warningBanner}>
          <Text style={styles.warningText}>
            ⚠ It's past 18:00 Friday — rules say no new trades right now, regardless of checklist.
          </Text>
        </View>
      ) : null}

      <Section title="Confluences">
        {items.map((item) => (
          <ChecklistItem
            key={item.key}
            label={item.label}
            required={item.required}
            checked={!!checked[item.key]}
            onToggle={() => toggle(item.key)}
          />
        ))}
      </Section>

      <View style={styles.row2}>
        <View style={styles.col}>
          <TextField
            label={`Risk:Reward (min 1:${MIN_RR})`}
            value={rr}
            onChangeText={setRr}
            keyboardType="decimal-pad"
            placeholder="3"
          />
        </View>
        <View style={styles.col}>
          <TextField
            label={`Quality Score (min ${MIN_QUALITY_SCORE})`}
            value={quality}
            onChangeText={setQuality}
            keyboardType="number-pad"
            placeholder="85"
          />
        </View>
      </View>

      <View
        style={[
          styles.verdictCard,
          { borderColor: evaluation.valid && !fridayCutoff ? colors.win : colors.loss },
        ]}
      >
        <Text
          style={[
            styles.verdictText,
            { color: evaluation.valid && !fridayCutoff ? colors.win : colors.loss },
          ]}
        >
          {fridayCutoff ? 'NO TRADE' : evaluation.verdictLabel}
        </Text>
        {!evaluation.valid || fridayCutoff ? (
          <View style={styles.missingWrap}>
            {fridayCutoff ? (
              <Text style={styles.missingItem}>• Outside allowed trading window (Friday 18:00+)</Text>
            ) : null}
            {evaluation.missing.map((m) => (
              <Text key={m.key} style={styles.missingItem}>
                • Missing: {m.label}
              </Text>
            ))}
          </View>
        ) : (
          <Text style={styles.verdictSub}>All required confluences aligned. SL must be set immediately on entry.</Text>
        )}
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.resetBtn} onPress={reset}>
          <Text style={styles.resetBtnText}>Reset Checklist</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.proceedBtn,
            !(evaluation.valid && !fridayCutoff) && styles.proceedBtnDisabled,
          ]}
          disabled={!(evaluation.valid && !fridayCutoff)}
          onPress={() => navigation.navigate('Journal', { screen: 'AddEditTrade' })}
        >
          <Text style={styles.proceedBtnText}>Log This Trade</Text>
        </TouchableOpacity>
      </View>

      <Section title="Standing Trading Rules" style={{ marginTop: spacing.xl }}>
        {TRADING_RULES.map((rule, i) => (
          <View key={i} style={styles.ruleRow}>
            <Text style={styles.ruleBullet}>{i + 1}.</Text>
            <Text style={styles.ruleText}>{rule}</Text>
          </View>
        ))}
      </Section>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl * 2 },
  eyebrow: { ...typography.eyebrow, color: colors.textMuted },
  title: { ...typography.h1, color: colors.textPrimary, marginTop: 2, marginBottom: spacing.lg },
  warningBanner: {
    backgroundColor: '#3A2A12',
    borderWidth: 1,
    borderColor: colors.warning,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  warningText: { color: colors.warning, ...typography.small, fontWeight: '600' },
  row2: { flexDirection: 'row', gap: spacing.md },
  col: { flex: 1 },
  verdictCard: {
    borderWidth: 2,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    backgroundColor: colors.surface,
  },
  verdictText: { ...typography.h1, fontWeight: '800', letterSpacing: 1 },
  verdictSub: {
    ...typography.small,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  missingWrap: { marginTop: spacing.md, alignSelf: 'stretch' },
  missingItem: { ...typography.small, color: colors.textSecondary, marginBottom: 4 },
  actionRow: { flexDirection: 'row', gap: spacing.md },
  resetBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  resetBtnText: { color: colors.textSecondary, fontWeight: '600' },
  proceedBtn: {
    flex: 1,
    backgroundColor: colors.gold,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  proceedBtnDisabled: { backgroundColor: colors.goldDim, opacity: 0.5 },
  proceedBtnText: { color: colors.background, fontWeight: '700' },
  ruleRow: { flexDirection: 'row', marginBottom: spacing.sm, paddingRight: spacing.sm },
  ruleBullet: { color: colors.gold, fontWeight: '700', marginRight: spacing.sm, width: 20 },
  ruleText: { ...typography.small, color: colors.textSecondary, flex: 1 },
});
