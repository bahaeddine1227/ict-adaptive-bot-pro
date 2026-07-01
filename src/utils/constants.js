export const DIRECTIONS = ['Buy', 'Sell'];

export const SESSIONS = ['Asian', 'London', 'New York'];

export const SETUP_TYPES = [
  'BOS',
  'CHOCH',
  'MSS',
  'FVG',
  'Breaker',
  'Liquidity Sweep',
  'Continuation',
];

export const RESULTS = ['Win', 'Loss', 'Breakeven'];

export const MIN_RR = 3;
export const MIN_QUALITY_SCORE = 85;

// Pre-trade checklist definitions. `key` maps to a boolean field on the
// checklist state. `required` items must ALL be true (plus RR + score gates)
// for the setup to be valid — otherwise the app must show "NO TRADE".
export const LONG_CHECKLIST = [
  { key: 'h4Bullish', label: 'H4 bullish trend', required: true },
  { key: 'h1Bos', label: 'H1 bullish BOS', required: true },
  { key: 'liquiditySweep', label: 'Liquidity sweep below support', required: true },
  { key: 'fvg', label: 'Bullish FVG present', required: true },
  { key: 'rsiAbove50', label: 'RSI above 50', required: true },
  { key: 'volumeConfirmation', label: 'Volume confirmation', required: true },
  { key: 'candleClose', label: 'Waited for candle close confirmation', required: true },
];

export const SHORT_CHECKLIST = [
  { key: 'h4Bearish', label: 'H4 bearish trend', required: true },
  { key: 'h1Bos', label: 'H1 bearish BOS', required: true },
  { key: 'liquiditySweep', label: 'Liquidity sweep above resistance', required: true },
  { key: 'fvg', label: 'Bearish FVG present', required: true },
  { key: 'rsiBelow50', label: 'RSI below 50', required: true },
  { key: 'volumeConfirmation', label: 'Volume confirmation', required: true },
  { key: 'candleClose', label: 'Waited for candle close confirmation', required: true },
];

export const TRADING_RULES = [
  'If any required condition is missing, the checklist shows NO TRADE.',
  'Never trade against the H4 trend.',
  'Stop Loss must be set immediately after entry.',
  'At +$15 profit: close 50% of the position and move Stop Loss to breakeven.',
  'No new trades after 18:00 on Fridays.',
  'Max 1 open trade at a time.',
  'Wait for candle close confirmation before entering.',
  'Keep a trade journal with screenshots and reasons for every trade.',
];

export function emptyTrade() {
  return {
    id: null,
    dateTime: new Date().toISOString(),
    pair: '',
    direction: 'Buy',
    session: 'London',
    setupType: 'BOS',
    entryPrice: '',
    stopLoss: '',
    takeProfit: '',
    lotSize: '',
    riskPercent: '',
    riskRewardRatio: '',
    qualityScore: '',
    result: 'Win',
    pnlDollars: '',
    screenshotUri: null,
    notes: '',
    // AI coach inputs (self-reported confluence flags)
    candleCloseConfirmed: true,
    alignedWithH4Trend: true,
    volumeConfirmed: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
