import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import {
  loadTrades,
  saveTrades,
  loadSettings,
  saveSettings,
  wipeAllData,
  DEFAULT_SETTINGS,
} from '../utils/storage';
import { generateId } from '../utils/id';
import { dashboardMetrics } from '../utils/calculations';

const TradeContext = createContext(null);

export function TradeProvider({ children }) {
  const [trades, setTrades] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const [t, s] = await Promise.all([loadTrades(), loadSettings()]);
      setTrades(t);
      setSettings(s);
      setReady(true);
    })();
  }, []);

  const persistTrades = useCallback(async (next) => {
    setTrades(next);
    await saveTrades(next);
  }, []);

  const addTrade = useCallback(
    async (trade) => {
      const now = new Date().toISOString();
      const newTrade = { ...trade, id: generateId(), createdAt: now, updatedAt: now };
      const next = [newTrade, ...trades];
      await persistTrades(next);
      return newTrade;
    },
    [trades, persistTrades]
  );

  const updateTrade = useCallback(
    async (id, patch) => {
      const next = trades.map((t) =>
        t.id === id ? { ...t, ...patch, updatedAt: new Date().toISOString() } : t
      );
      await persistTrades(next);
    },
    [trades, persistTrades]
  );

  const deleteTrade = useCallback(
    async (id) => {
      const next = trades.filter((t) => t.id !== id);
      await persistTrades(next);
    },
    [trades, persistTrades]
  );

  const clearAllTrades = useCallback(async () => {
    await persistTrades([]);
  }, [persistTrades]);

  const updateSettings = useCallback(async (patch) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      saveSettings(next);
      return next;
    });
  }, []);

  const restoreFromBackup = useCallback(async (backup) => {
    const restoredTrades = Array.isArray(backup.trades) ? backup.trades : [];
    const restoredSettings = backup.settings
      ? { ...DEFAULT_SETTINGS, ...backup.settings }
      : DEFAULT_SETTINGS;
    await saveTrades(restoredTrades);
    await saveSettings(restoredSettings);
    setTrades(restoredTrades);
    setSettings(restoredSettings);
  }, []);

  const factoryReset = useCallback(async () => {
    await wipeAllData();
    setTrades([]);
    setSettings(DEFAULT_SETTINGS);
  }, []);

  const metrics = useMemo(() => dashboardMetrics(trades), [trades]);

  const openTradesCount = useMemo(
    () => trades.filter((t) => t.status === 'open').length,
    [trades]
  );

  const value = {
    ready,
    trades,
    settings,
    metrics,
    openTradesCount,
    addTrade,
    updateTrade,
    deleteTrade,
    clearAllTrades,
    updateSettings,
    restoreFromBackup,
    factoryReset,
  };

  return <TradeContext.Provider value={value}>{children}</TradeContext.Provider>;
}

export function useTrades() {
  const ctx = useContext(TradeContext);
  if (!ctx) throw new Error('useTrades must be used within a TradeProvider');
  return ctx;
}
