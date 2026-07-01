import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import * as DocumentPicker from 'expo-document-picker';
import { dashboardMetrics, performanceBy } from './calculations';

const CSV_COLUMNS = [
  'dateTime',
  'pair',
  'direction',
  'session',
  'setupType',
  'entryPrice',
  'stopLoss',
  'takeProfit',
  'lotSize',
  'riskPercent',
  'riskRewardRatio',
  'qualityScore',
  'result',
  'pnlDollars',
  'notes',
];

function csvEscape(value) {
  const str = value === undefined || value === null ? '' : String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/** Builds CSV text. Opens natively in Excel, Google Sheets, and Numbers. */
export function buildCsv(trades) {
  const header = CSV_COLUMNS.join(',');
  const rows = trades.map((t) => CSV_COLUMNS.map((c) => csvEscape(t[c])).join(','));
  return [header, ...rows].join('\n');
}

async function shareFile(fileUri, mimeType, dialogTitle) {
  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(fileUri, { mimeType, dialogTitle });
  }
  return fileUri;
}

export async function exportCsv(trades) {
  const csv = buildCsv(trades);
  const fileUri = `${FileSystem.documentDirectory}ict_trade_journal_${Date.now()}.csv`;
  await FileSystem.writeAsStringAsync(fileUri, csv, { encoding: FileSystem.EncodingType.UTF8 });
  await shareFile(fileUri, 'text/csv', 'Export Trade Journal (CSV)');
  return fileUri;
}

/** JSON backup of trades + settings — full fidelity, used for restore. */
export async function exportBackup(trades, settings) {
  const payload = {
    app: 'ICT Adaptive Bot Pro',
    exportedAt: new Date().toISOString(),
    version: 1,
    trades,
    settings,
  };
  const fileUri = `${FileSystem.documentDirectory}ict_backup_${Date.now()}.json`;
  await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(payload, null, 2), {
    encoding: FileSystem.EncodingType.UTF8,
  });
  await shareFile(fileUri, 'application/json', 'Export Backup (JSON)');
  return fileUri;
}

/** Prompts the user to pick a previously exported backup JSON file. */
export async function pickBackupFile() {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['application/json', 'text/*', '*/*'],
    copyToCacheDirectory: true,
  });
  if (result.canceled || !result.assets || !result.assets[0]) return null;
  const uri = result.assets[0].uri;
  const content = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.UTF8,
  });
  const parsed = JSON.parse(content);
  if (!parsed || !Array.isArray(parsed.trades)) {
    throw new Error('Invalid backup file — no trades array found.');
  }
  return parsed;
}

function fmt(n, digits = 2) {
  const v = Number.isFinite(n) ? n : 0;
  return v.toFixed(digits);
}

function buildReportHtml(trades) {
  const m = dashboardMetrics(trades);
  const bySetup = performanceBy(trades, (t) => t.setupType);
  const bySession = performanceBy(trades, (t) => t.session);
  const byPair = performanceBy(trades, (t) => t.pair);

  const rowsFor = (list) =>
    list
      .map(
        (r) => `<tr>
        <td>${r.key}</td>
        <td>${r.trades}</td>
        <td>${fmt(r.winRate, 1)}%</td>
        <td>$${fmt(r.netPnl)}</td>
        <td>1:${fmt(r.avgRR, 2)}</td>
      </tr>`
      )
      .join('');

  return `
  <html>
    <head>
      <meta charset="utf-8" />
      <style>
        body { font-family: -apple-system, Helvetica, Arial, sans-serif; background:#0A0A0A; color:#F5F1E6; padding: 24px; }
        h1 { color:#D4AF37; margin-bottom:0; }
        h2 { color:#D4AF37; border-bottom: 1px solid #3A342A; padding-bottom:6px; margin-top:32px; }
        .sub { color:#B9B2A0; margin-top:4px; }
        table { width:100%; border-collapse: collapse; margin-top:12px; }
        th, td { text-align:left; padding:8px; border-bottom:1px solid #2A2620; font-size:13px;}
        th { color:#D4AF37; text-transform:uppercase; font-size:11px; letter-spacing:1px;}
        .grid { display:flex; flex-wrap:wrap; gap:12px; margin-top:16px;}
        .stat { background:#141414; border:1px solid #2A2620; border-radius:10px; padding:14px; width:30%; box-sizing:border-box;}
        .stat .label { color:#B9B2A0; font-size:11px; text-transform:uppercase; letter-spacing:1px;}
        .stat .value { color:#F1D571; font-size:20px; font-weight:700; margin-top:4px;}
      </style>
    </head>
    <body>
      <h1>ICT Adaptive Bot Pro</h1>
      <div class="sub">Trading Performance Report — generated ${new Date().toLocaleString()}</div>

      <div class="grid">
        <div class="stat"><div class="label">Total Trades</div><div class="value">${m.totalTrades}</div></div>
        <div class="stat"><div class="label">Win Rate</div><div class="value">${fmt(m.winRate, 1)}%</div></div>
        <div class="stat"><div class="label">Net P/L</div><div class="value">$${fmt(m.netPnl)}</div></div>
        <div class="stat"><div class="label">Profit Factor</div><div class="value">${fmt(m.profitFactor)}</div></div>
        <div class="stat"><div class="label">Average RR</div><div class="value">1:${fmt(m.avgRR)}</div></div>
        <div class="stat"><div class="label">Avg Quality Score</div><div class="value">${fmt(m.avgQualityScore, 1)}</div></div>
        <div class="stat"><div class="label">Best Pair</div><div class="value">${m.bestPair || '-'}</div></div>
        <div class="stat"><div class="label">Best Session</div><div class="value">${m.bestSession || '-'}</div></div>
        <div class="stat"><div class="label">Best Setup</div><div class="value">${m.bestSetup || '-'}</div></div>
      </div>

      <h2>Setup Performance</h2>
      <table><tr><th>Setup</th><th>Trades</th><th>Win Rate</th><th>Net P/L</th><th>Avg RR</th></tr>${rowsFor(bySetup)}</table>

      <h2>Session Performance</h2>
      <table><tr><th>Session</th><th>Trades</th><th>Win Rate</th><th>Net P/L</th><th>Avg RR</th></tr>${rowsFor(bySession)}</table>

      <h2>Pair Performance</h2>
      <table><tr><th>Pair</th><th>Trades</th><th>Win Rate</th><th>Net P/L</th><th>Avg RR</th></tr>${rowsFor(byPair)}</table>
    </body>
  </html>`;
}

/** Generates a PDF performance report and opens the native share sheet. */
export async function exportPdfReport(trades) {
  const html = buildReportHtml(trades);
  const { uri } = await Print.printToFileAsync({ html });
  await shareFile(uri, 'application/pdf', 'Export Performance Report (PDF)');
  return uri;
}
