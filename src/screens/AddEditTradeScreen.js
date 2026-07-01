import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTrades } from '../context/TradeContext';
import { colors, radius, spacing, typography } from '../theme/colors';
import { TextField, ChipSelector, ToggleRow } from '../components/FormField';
import {
  DIRECTIONS,
  SESSIONS,
  SETUP_TYPES,
  RESULTS,
  emptyTrade,
} from '../utils/constants';
import { analyzeTrade } from '../utils/aiCoach';

function computeRR(entry, sl, tp) {
  const e = parseFloat(entry);
  const s = parseFloat(sl);
  const t = parseFloat(tp);
  if (!Number.isFinite(e) || !Number.isFinite(s) || !Number.isFinite(t)) return '';
  const risk = Math.abs(e - s);
  const reward = Math.abs(t - e);
  if (risk === 0) return '';
  return (reward / risk).toFixed(2);
}

export default function AddEditTradeScreen({ route, navigation }) {
  const { trades, addTrade, updateTrade, deleteTrade } = useTrades();
  const tradeId = route.params?.tradeId;
  const existing = useMemo(() => trades.find((t) => t.id === tradeId), [trades, tradeId]);

  const [form, setForm] = useState(existing || emptyTrade());
  const [coachResult, setCoachResult] = useState(null);

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const autoRR = useMemo(
    () => computeRR(form.entryPrice, form.stopLoss, form.takeProfit),
    [form.entryPrice, form.stopLoss, form.takeProfit]
  );

  const pickScreenshot = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow photo access to attach a trade screenshot.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets[0]) {
      setField('screenshotUri', result.assets[0].uri);
    }
  };

  const validate = () => {
    if (!form.pair.trim()) {
      Alert.alert('Missing pair', 'Please enter a pair/symbol.');
      return false;
    }
    if (!form.stopLoss) {
      Alert.alert(
        'Stop Loss required',
        'Rule: Stop Loss must be set immediately. Please enter a Stop Loss.'
      );
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;

    const finalRR = form.riskRewardRatio || autoRR || '0';
    const payload = { ...form, riskRewardRatio: finalRR };

    let saved;
    if (existing) {
      await updateTrade(existing.id, payload);
      saved = { ...existing, ...payload };
    } else {
      saved = await addTrade(payload);
    }

    const result = analyzeTrade(saved);
    setCoachResult(result);
  };

  const handleDelete = () => {
    Alert.alert('Delete trade', 'This cannot be undone. Delete this trade?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteTrade(existing.id);
          navigation.goBack();
        },
      },
    ]);
  };

  if (coachResult) {
    const verdictColor =
      coachResult.verdict === 'good'
        ? colors.win
        : coachResult.verdict === 'warning'
        ? colors.warning
        : colors.loss;
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.coachContent}>
          <Text style={styles.coachEyebrow}>AI Coach Feedback</Text>
          <Text style={[styles.coachVerdict, { color: verdictColor }]}>
            {coachResult.verdict === 'good'
              ? 'Solid Execution'
              : coachResult.verdict === 'warning'
              ? 'Minor Issues'
              : 'Needs Review'}
          </Text>
          {coachResult.feedback.map((line, i) => (
            <View key={i} style={styles.coachLine}>
              <Text style={styles.coachBullet}>•</Text>
              <Text style={styles.coachText}>{line}</Text>
            </View>
          ))}
          <TouchableOpacity
            style={styles.doneBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <TextField
          label="Pair / Symbol"
          value={form.pair}
          onChangeText={(v) => setField('pair', v)}
          placeholder="e.g. EURUSD"
        />

        <ChipSelector
          label="Direction"
          options={DIRECTIONS}
          value={form.direction}
          onChange={(v) => setField('direction', v)}
        />
        <ChipSelector
          label="Session"
          options={SESSIONS}
          value={form.session}
          onChange={(v) => setField('session', v)}
        />
        <ChipSelector
          label="Setup Type"
          options={SETUP_TYPES}
          value={form.setupType}
          onChange={(v) => setField('setupType', v)}
        />

        <View style={styles.row2}>
          <View style={styles.col}>
            <TextField
              label="Entry Price"
              value={String(form.entryPrice)}
              onChangeText={(v) => setField('entryPrice', v)}
              keyboardType="decimal-pad"
              placeholder="0.00000"
            />
          </View>
          <View style={styles.col}>
            <TextField
              label="Stop Loss"
              value={String(form.stopLoss)}
              onChangeText={(v) => setField('stopLoss', v)}
              keyboardType="decimal-pad"
              placeholder="0.00000"
            />
          </View>
        </View>

        <View style={styles.row2}>
          <View style={styles.col}>
            <TextField
              label="Take Profit"
              value={String(form.takeProfit)}
              onChangeText={(v) => setField('takeProfit', v)}
              keyboardType="decimal-pad"
              placeholder="0.00000"
            />
          </View>
          <View style={styles.col}>
            <TextField
              label="Lot Size"
              value={String(form.lotSize)}
              onChangeText={(v) => setField('lotSize', v)}
              keyboardType="decimal-pad"
              placeholder="0.10"
            />
          </View>
        </View>

        <View style={styles.row2}>
          <View style={styles.col}>
            <TextField
              label="Risk %"
              value={String(form.riskPercent)}
              onChangeText={(v) => setField('riskPercent', v)}
              keyboardType="decimal-pad"
              placeholder="1"
            />
          </View>
          <View style={styles.col}>
            <TextField
              label={`Risk:Reward${autoRR ? ` (auto: 1:${autoRR})` : ''}`}
              value={String(form.riskRewardRatio)}
              onChangeText={(v) => setField('riskRewardRatio', v)}
              keyboardType="decimal-pad"
              placeholder={autoRR || '3'}
            />
          </View>
        </View>

        <TextField
          label="Trade Quality Score (0-100)"
          value={String(form.qualityScore)}
          onChangeText={(v) => setField('qualityScore', v)}
          keyboardType="number-pad"
          placeholder="85"
        />

        <ChipSelector
          label="Result"
          options={RESULTS}
          value={form.result}
          onChange={(v) => setField('result', v)}
        />

        <TextField
          label="Profit / Loss ($)"
          value={String(form.pnlDollars)}
          onChangeText={(v) => setField('pnlDollars', v)}
          keyboardType="numbers-and-punctuation"
          placeholder="e.g. 45 or -20"
        />

        <View style={styles.fieldWrap}>
          <Text style={styles.label}>Screenshot</Text>
          {form.screenshotUri ? (
            <TouchableOpacity onPress={pickScreenshot}>
              <Image source={{ uri: form.screenshotUri }} style={styles.screenshot} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.uploadBox} onPress={pickScreenshot}>
              <Text style={styles.uploadText}>+ Attach chart screenshot</Text>
            </TouchableOpacity>
          )}
        </View>

        <TextField
          label="Notes / Reasoning"
          value={form.notes}
          onChangeText={(v) => setField('notes', v)}
          multiline
          placeholder="Why did you take this trade?"
        />

        <View style={styles.divider} />
        <Text style={styles.sectionLabel}>Confluence Check (for AI Coach)</Text>
        <ToggleRow
          label="Waited for candle close confirmation"
          value={form.candleCloseConfirmed}
          onChange={(v) => setField('candleCloseConfirmed', v)}
        />
        <ToggleRow
          label="Aligned with H4 trend"
          value={form.alignedWithH4Trend}
          onChange={(v) => setField('alignedWithH4Trend', v)}
        />
        <ToggleRow
          label="Volume confirmation present"
          value={form.volumeConfirmed}
          onChange={(v) => setField('volumeConfirmed', v)}
        />

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>{existing ? 'Update Trade' : 'Save Trade'}</Text>
        </TouchableOpacity>

        {existing ? (
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
            <Text style={styles.deleteBtnText}>Delete Trade</Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl * 2 },
  row2: { flexDirection: 'row', gap: spacing.md },
  col: { flex: 1 },
  fieldWrap: { marginBottom: spacing.lg },
  label: { ...typography.eyebrow, color: colors.textMuted, marginBottom: spacing.sm },
  uploadBox: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.borderLight,
    borderRadius: radius.md,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  uploadText: { color: colors.textMuted, ...typography.body },
  screenshot: { width: '100%', height: 180, borderRadius: radius.md },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.lg },
  sectionLabel: {
    ...typography.eyebrow,
    color: colors.gold,
    marginBottom: spacing.sm,
  },
  saveBtn: {
    backgroundColor: colors.gold,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  saveBtnText: { color: colors.background, fontWeight: '700', fontSize: 16 },
  deleteBtn: {
    borderWidth: 1,
    borderColor: colors.loss,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  deleteBtnText: { color: colors.loss, fontWeight: '700' },
  coachContent: { padding: spacing.xl, alignItems: 'stretch' },
  coachEyebrow: { ...typography.eyebrow, color: colors.textMuted, textAlign: 'center' },
  coachVerdict: {
    ...typography.h1,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  coachLine: { flexDirection: 'row', marginBottom: spacing.md, paddingHorizontal: spacing.sm },
  coachBullet: { color: colors.gold, marginRight: spacing.sm, fontSize: 16 },
  coachText: { ...typography.body, color: colors.textPrimary, flex: 1 },
  doneBtn: {
    backgroundColor: colors.gold,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  doneBtnText: { color: colors.background, fontWeight: '700', fontSize: 16 },
});
