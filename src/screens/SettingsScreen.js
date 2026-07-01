import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useTrades } from '../context/TradeContext';
import { colors, radius, spacing, typography } from '../theme/colors';
import Section from '../components/Section';
import { TextField, ToggleRow } from '../components/FormField';
import { TRADING_RULES } from '../utils/constants';

export default function SettingsScreen() {
  const { settings, updateSettings, factoryReset, trades } = useTrades();
  const [startingBalance, setStartingBalance] = useState(String(settings.startingBalance ?? 0));

  useEffect(() => {
    setStartingBalance(String(settings.startingBalance ?? 0));
  }, [settings.startingBalance]);

  const handleBalanceBlur = () => {
    const n = parseFloat(startingBalance) || 0;
    updateSettings({ startingBalance: n });
  };

  const confirmReset = () => {
    Alert.alert(
      'Erase all data',
      `This permanently deletes all ${trades.length} trade(s) and resets settings on this device. This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Erase Everything', style: 'destructive', onPress: () => factoryReset() },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>Configuration</Text>
      <Text style={styles.title}>Settings</Text>

      <Section title="Account">
        <View style={styles.card}>
          <TextField
            label="Starting Balance ($)"
            value={startingBalance}
            onChangeText={setStartingBalance}
            keyboardType="decimal-pad"
            placeholder="0"
          />
          <TouchableOpacity style={styles.saveInlineBtn} onPress={handleBalanceBlur}>
            <Text style={styles.saveInlineText}>Save Balance</Text>
          </TouchableOpacity>
        </View>
      </Section>

      <Section title="Risk Automation Rules">
        <View style={styles.card}>
          <ToggleRow
            label="Enforce no-trade after 18:00 Friday"
            value={settings.fridayCutoffEnabled}
            onChange={(v) => updateSettings({ fridayCutoffEnabled: v })}
          />
          <TextField
            label="Partial-close profit target ($)"
            value={String(settings.partialCloseTarget)}
            onChangeText={(v) => updateSettings({ partialCloseTarget: parseFloat(v) || 0 })}
            keyboardType="decimal-pad"
            placeholder="15"
          />
          <Text style={styles.helperText}>
            At this profit, the rule is: close 50% of the position and move Stop Loss to
            breakeven.
          </Text>
        </View>
      </Section>

      <Section title="Standing Trading Rules">
        <View style={styles.card}>
          {TRADING_RULES.map((rule, i) => (
            <View key={i} style={styles.ruleRow}>
              <Text style={styles.ruleBullet}>{i + 1}.</Text>
              <Text style={styles.ruleText}>{rule}</Text>
            </View>
          ))}
        </View>
      </Section>

      <Section title="About">
        <View style={styles.card}>
          <Text style={styles.aboutTitle}>ICT Adaptive Bot Pro</Text>
          <Text style={styles.aboutBody}>
            Version 1.0.0 · All data is stored locally on this device only. No account, login,
            or internet connection is required. No biometric or PIN lock is used.
          </Text>
        </View>
      </Section>

      <Section title="Danger Zone">
        <View style={[styles.card, styles.dangerCard]}>
          <Text style={styles.dangerTitle}>Erase All Data</Text>
          <Text style={styles.cardDesc}>
            Permanently deletes every trade and resets settings on this device. Export a backup
            first if you want to keep your history.
          </Text>
          <TouchableOpacity style={styles.dangerBtn} onPress={confirmReset}>
            <Text style={styles.dangerBtnText}>Erase All Data</Text>
          </TouchableOpacity>
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
    padding: spacing.lg,
  },
  saveInlineBtn: {
    backgroundColor: colors.goldDim,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  saveInlineText: { color: colors.background, fontWeight: '700' },
  helperText: { ...typography.small, color: colors.textMuted, marginTop: -spacing.sm },
  ruleRow: { flexDirection: 'row', marginBottom: spacing.sm },
  ruleBullet: { color: colors.gold, fontWeight: '700', marginRight: spacing.sm, width: 20 },
  ruleText: { ...typography.small, color: colors.textSecondary, flex: 1 },
  aboutTitle: { ...typography.h3, color: colors.gold, marginBottom: spacing.sm },
  aboutBody: { ...typography.small, color: colors.textSecondary, lineHeight: 18 },
  dangerCard: { borderColor: colors.loss },
  dangerTitle: { ...typography.h3, color: colors.loss, marginBottom: spacing.xs },
  cardDesc: { ...typography.small, color: colors.textMuted, marginBottom: spacing.md },
  dangerBtn: {
    borderWidth: 1,
    borderColor: colors.loss,
    borderRadius: radius.md,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
  },
  dangerBtnText: { color: colors.loss, fontWeight: '700' },
});
