import { MIN_RR, MIN_QUALITY_SCORE } from './constants';

function num(v) {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Fully local, rule-based coaching engine. No network / API calls.
 * Inspects a single trade object and returns an array of feedback strings,
 * plus an overall verdict ('good' | 'warning' | 'bad').
 */
export function analyzeTrade(trade) {
  const feedback = [];
  const rr = num(trade.riskRewardRatio);
  const quality = num(trade.qualityScore);
  const riskPercent = num(trade.riskPercent);
  const pnl = num(trade.pnlDollars);

  let issues = 0;

  if (trade.candleCloseConfirmed === false) {
    feedback.push('You entered before candle close confirmation.');
    issues += 1;
  }

  if (rr > 0 && rr < MIN_RR) {
    feedback.push(`RR was below 1:${MIN_RR} (recorded 1:${rr.toFixed(1)}).`);
    issues += 1;
  }

  if (trade.alignedWithH4Trend === false) {
    feedback.push('Trade was against the H4 trend.');
    issues += 1;
  }

  if (trade.volumeConfirmed === false) {
    feedback.push('Volume confirmation was missing.');
    issues += 1;
  }

  if (quality > 0 && quality < MIN_QUALITY_SCORE) {
    feedback.push(`Quality score was below ${MIN_QUALITY_SCORE} (recorded ${quality}).`);
    issues += 1;
  }

  if (!trade.stopLoss) {
    feedback.push('No Stop Loss was recorded — SL must always be set immediately.');
    issues += 1;
  }

  if (riskPercent > 2) {
    feedback.push(`Risk of ${riskPercent}% on this trade is above a conservative 2% cap.`);
    issues += 1;
  }

  if (!trade.screenshotUri) {
    feedback.push('No screenshot attached — keep every trade documented visually.');
  }

  const day = new Date(trade.dateTime).getDay();
  const hour = new Date(trade.dateTime).getHours();
  if (day === 5 && hour >= 18) {
    feedback.push('Entered after 18:00 on Friday — outside the trading window.');
    issues += 1;
  }

  if (trade.result === 'Loss' && pnl < 0 && riskPercent > 0) {
    feedback.push('Loss recorded — review whether risk sizing matched the plan.');
  }

  if (issues === 0) {
    feedback.unshift('Good trade: all major confluences aligned.');
  }

  let verdict = 'good';
  if (issues === 1) verdict = 'warning';
  if (issues >= 2) verdict = 'bad';

  return { feedback, verdict, issues };
}

/**
 * Evaluate the pre-trade checklist for a given direction.
 * Returns { valid, missing: [labels], verdictLabel }.
 */
export function evaluateChecklist(direction, checklistItems, checkedState, rr, qualityScore) {
  const missing = checklistItems.filter((item) => item.required && !checkedState[item.key]);
  const rrOk = num(rr) >= MIN_RR;
  const qualityOk = num(qualityScore) >= MIN_QUALITY_SCORE;

  if (!rrOk) missing.push({ key: 'rr', label: `Minimum Risk-to-Reward of 1:${MIN_RR}` });
  if (!qualityOk)
    missing.push({ key: 'quality', label: `Trade Quality Score above ${MIN_QUALITY_SCORE}` });

  const valid = missing.length === 0;
  return {
    valid,
    missing,
    verdictLabel: valid ? 'TRADE VALID' : 'NO TRADE',
  };
}

/** True if "now" (or a given date) is after 18:00 on a Friday. */
export function isAfterFridayCutoff(date = new Date()) {
  const day = date.getDay(); // 5 = Friday
  const hour = date.getHours();
  return day === 5 && hour >= 18;
}
