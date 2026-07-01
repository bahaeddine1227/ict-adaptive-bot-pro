import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useTrades } from '../context/TradeContext';
import { colors, radius, spacing, typography } from '../theme/colors';
import Section from '../components/Section';
import { exportCsv, exportBackup, exportPdfReport, pickBackupFile } from '../utils/exportUtils';

function ActionCard({ title, description, buttonLabel, onPress, loading, tone }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardDesc}>{description}</Text>
      <TouchableOpacity
        style={[styles.btn, tone === 'danger' && styles.btnDanger]}
        onPress={onPress}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={colors.background} />
        ) : (
          <Text style={[styles.btnText, tone === 'danger' && styles.btnTextDanger]}>
            {buttonLabel}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

export default function ExportScreen() {
  const { trades, settings, restoreFromBackup } = useTrades();
  const [loadingKey, setLoadingKey] = useState(null);

  const run = async (key, fn) => {
    if (trades.length === 0 && key !== 'restore') {
      Alert.alert('No trades', 'Log at least one trade before exporting.');
      return;
    }
    setLoadingKey(key);
    try {
      await fn();
    } catch (e) {
      Alert.alert('Export failed', e.message || 'Something went wrong.');
    } finally {
      setLoadingKey(null);
    }
  };

  const handleRestore = async () => {
    setLoadingKey('restore');
    try {
      const backup = await pickBackupFile();
      if (!backup) {
        setLoadingKey(null);
        return;
      }
      Alert.alert(
        'Restore backup',
        `This will replace your current ${trades.length} trade(s) with ${backup.trades.length} trade(s) from the backup. Continue?`,
        [
          { text: 'Cancel', style: 'cancel', onPress: () => setLoadingKey(null) },
          {
            text: 'Restore',
            style: 'destructive',
            onPress: async () => {
              await restoreFromBackup(backup);
              setLoadingKey(null);
              Alert.alert('Restored', 'Your trade journal has been restored from backup.');
            },
          },
        ]
      );
    } catch (e) {
      setLoadingKey(null);
      Alert.alert('Restore failed', e.message || 'Invalid backup file.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>Data</Text>
      <Text style={styles.title}>Export & Backup</Text>
      <Text style={styles.subtitle}>
        Everything is stored locally on this device. Export or back up your journal any time —
        no account or internet connection required.
      </Text>

      <Section title="Export">
        <ActionCard
          title="CSV Export"
          description="Excel-compatible spreadsheet of every trade field — opens directly in Excel, Sheets, or Numbers."
          buttonLabel="Export CSV"
          loading={loadingKey === 'csv'}
          onPress={() => run('csv', () => exportCsv(trades))}
        />
        <ActionCard
          title="PDF Performance Report"
          description="A formatted report with your key metrics and setup/session/pair breakdowns."
          buttonLabel="Export PDF Report"
          loading={loadingKey === 'pdf'}
          onPress={() => run('pdf', () => exportPdfReport(trades))}
        />
      </Section>

      <Section title="Backup & Restore">
        <ActionCard
          title="Full JSON Backup"
          description="A complete backup of all trades and settings. Keep this safe — use it to restore your journal on this or another device."
          buttonLabel="Export Backup"
          loading={loadingKey === 'backup'}
          onPress={() => run('backup', () => exportBackup(trades, settings))}
        />
        <ActionCard
          title="Restore from Backup"
          description="Pick a previously exported JSON backup file to restore your trades and settings. This replaces current data."
          buttonLabel="Choose Backup File"
          loading={loadingKey === 'restore'}
          tone="danger"
          onPress={handleRestore}
        />
      </Section>

      <Text style={styles.footnote}>{trades.length} trade(s) currently stored on this device.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl * 2 },
  eyebrow: { ...typography.eyebrow, color: colors.textMuted },
  title: { ...typography.h1, color: colors.textPrimary, marginTop: 2, marginBottom: spacing.sm },
  subtitle: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.xl },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.xs },
  cardDesc: { ...typography.small, color: colors.textMuted, marginBottom: spacing.md },
  btn: {
    backgroundColor: colors.gold,
    borderRadius: radius.md,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
  },
  btnDanger: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.loss },
  btnText: { color: colors.background, fontWeight: '700' },
  btnTextDanger: { color: colors.loss },
  footnote: { ...typography.small, color: colors.textMuted, textAlign: 'center', marginTop: spacing.md },
});
