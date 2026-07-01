// All calculations are pure functions operating on the trades array.
// A trade: { dateTime, pair, direction, session, setupType, entryPrice,
//   stopLoss, takeProfit, lotSize, riskPercent, riskRewardRatio,
//   qualityScore, result, pnlDollars, notes, screenshotUri, ... }

function num(v) {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
}

function startOfWeek(d) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = (day === 0 ? -6 : 1) - day; // Monday as start
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function isSameMonth(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

export function groupBy(trades, keyFn) {
  const map = {};
  trades.forEach((t) => {
    const k = keyFn(t) || 'Unknown';
    if (!map[k]) map[k] = [];
    map[k].push(t);
  });
  return map;
}

export function winRate(trades) {
  if (!trades.length) return 0;
  const wins = trades.filter((t) => t.result === 'Win').length;
  return (wins / trades.length) * 100;
}

export function netPnl(trades) {
  return trades.reduce((sum, t) => sum + num(t.pnlDollars), 0);
}

export function profitFactor(trades) {
  const grossWin = trades
    .filter((t) => num(t.pnlDollars) > 0)
    .reduce((s, t) => s + num(t.pnlDollars), 0);
  const grossLoss = Math.abs(
    trades.filter((t) => num(t.pnlDollars) < 0).reduce((s, t) => s + num(t.pnlDollars), 0)
  );
  if (grossLoss === 0) return grossWin > 0 ? grossWin : 0;
  return grossWin / grossLoss;
}

export function averageRR(trades) {
  if (!trades.length) return 0;
  const total = trades.reduce((s, t) => s + num(t.riskRewardRatio), 0);
  return total / trades.length;
}

export function averageQualityScore(trades) {
  if (!trades.length) return 0;
  const total = trades.reduce((s, t) => s + num(t.qualityScore), 0);
  return total / trades.length;
}

function bestWorstByGroup(trades, keyFn) {
  const groups = groupBy(trades, keyFn);
  let best = null;
  let worst = null;
  let bestVal = -Infinity;
  let worstVal = Infinity;
  Object.entries(groups).forEach(([key, list]) => {
    const pnl = netPnl(list);
    if (pnl > bestVal) {
      bestVal = pnl;
      best = key;
    }
    if (pnl < worstVal) {
      worstVal = pnl;
      worst = key;
    }
  });
  return { best, worst, bestVal, worstVal };
}

export function bestWorstPair(trades) {
  return bestWorstByGroup(trades, (t) => t.pair);
}

export function bestSession(trades) {
  const groups = groupBy(trades, (t) => t.session);
  let best = null;
  let bestVal = -Infinity;
  Object.entries(groups).forEach(([key, list]) => {
    const pnl = netPnl(list);
    if (pnl > bestVal) {
      bestVal = pnl;
      best = key;
    }
  });
  return best;
}

export function bestSetup(trades) {
  const groups = groupBy(trades, (t) => t.setupType);
  let best = null;
  let bestVal = -Infinity;
  Object.entries(groups).forEach(([key, list]) => {
    const pnl = netPnl(list);
    if (pnl > bestVal) {
      bestVal = pnl;
      best = key;
    }
  });
  return best;
}

export function streaks(trades) {
  // sorted ascending by date
  const sorted = [...trades].sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
  let curWin = 0;
  let curLoss = 0;
  let maxWin = 0;
  let maxLoss = 0;
  sorted.forEach((t) => {
    if (t.result === 'Win') {
      curWin += 1;
      curLoss = 0;
    } else if (t.result === 'Loss') {
      curLoss += 1;
      curWin = 0;
    } else {
      curWin = 0;
      curLoss = 0;
    }
    maxWin = Math.max(maxWin, curWin);
    maxLoss = Math.max(maxLoss, curLoss);
  });
  return { maxWinStreak: maxWin, maxLossStreak: maxLoss };
}

export function monthlyProfit(trades, ref = new Date()) {
  return netPnl(trades.filter((t) => isSameMonth(new Date(t.dateTime), ref)));
}

export function weeklyProfit(trades, ref = new Date()) {
  const start = startOfWeek(ref);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return netPnl(
    trades.filter((t) => {
      const d = new Date(t.dateTime);
      return d >= start && d < end;
    })
  );
}

export function equityCurve(trades, startingBalance = 0) {
  const sorted = [...trades].sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
  let balance = startingBalance;
  const points = [{ x: 0, y: balance, label: 'Start' }];
  sorted.forEach((t, i) => {
    balance += num(t.pnlDollars);
    points.push({ x: i + 1, y: balance, label: t.pair, date: t.dateTime });
  });
  return points;
}

export function dashboardMetrics(trades) {
  const wins = trades.filter((t) => t.result === 'Win').length;
  const losses = trades.filter((t) => t.result === 'Loss').length;
  const breakeven = trades.filter((t) => t.result === 'Breakeven').length;
  const { best: bp, worst: wp } = bestWorstPair(trades);
  const { maxWinStreak, maxLossStreak } = streaks(trades);
  return {
    totalTrades: trades.length,
    wins,
    losses,
    breakeven,
    winRate: winRate(trades),
    netPnl: netPnl(trades),
    profitFactor: profitFactor(trades),
    avgRR: averageRR(trades),
    avgQualityScore: averageQualityScore(trades),
    bestPair: bp,
    worstPair: wp,
    bestSession: bestSession(trades),
    bestSetup: bestSetup(trades),
    winningStreak: maxWinStreak,
    losingStreak: maxLossStreak,
    monthlyProfit: monthlyProfit(trades),
    weeklyProfit: weeklyProfit(trades),
    equityCurve: equityCurve(trades),
  };
}

export function performanceBy(trades, keyFn) {
  const groups = groupBy(trades, keyFn);
  return Object.entries(groups)
    .map(([key, list]) => ({
      key,
      trades: list.length,
      winRate: winRate(list),
      netPnl: netPnl(list),
      avgRR: averageRR(list),
      avgQuality: averageQualityScore(list),
      profitFactor: profitFactor(list),
    }))
    .sort((a, b) => b.netPnl - a.netPnl);
}

export function monthlyReport(trades) {
  const groups = groupBy(trades, (t) => {
    const d = new Date(t.dateTime);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  return Object.entries(groups)
    .map(([month, list]) => ({
      month,
      trades: list.length,
      netPnl: netPnl(list),
      winRate: winRate(list),
    }))
    .sort((a, b) => (a.month < b.month ? 1 : -1));
}

// Returns a map of 'YYYY-MM-DD' -> net P/L for that day, for calendar heatmap.
export function dailyPnlMap(trades) {
  const map = {};
  trades.forEach((t) => {
    const d = new Date(t.dateTime);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate()
    ).padStart(2, '0')}`;
    map[key] = (map[key] || 0) + num(t.pnlDollars);
  });
  return map;
}
