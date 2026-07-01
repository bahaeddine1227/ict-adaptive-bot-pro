import AsyncStorage from '@react-native-async-storage/async-storage';

const TRADES_KEY = '@ict_adaptive_bot_pro/trades';
const SETTINGS_KEY = '@ict_adaptive_bot_pro/settings';

export const DEFAULT_SETTINGS = {
  startingBalance: 0,
  accountCurrency: 'USD',
  maxOpenTrades: 1,
  fridayCutoffEnabled: true,
  partialCloseTarget: 15, // dollars — close 50% and move SL to breakeven
};

export async function loadTrades() {
  try {
    const raw = await AsyncStorage.getItem(TRADES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn('Failed to load trades', e);
    return [];
  }
}

export async function saveTrades(trades) {
  try {
    await AsyncStorage.setItem(TRADES_KEY, JSON.stringify(trades));
    return true;
  } catch (e) {
    console.warn('Failed to save trades', e);
    return false;
  }
}

export async function loadSettings() {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch (e) {
    console.warn('Failed to load settings', e);
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings) {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    return true;
  } catch (e) {
    console.warn('Failed to save settings', e);
    return false;
  }
}

export async function wipeAllData() {
  try {
    await AsyncStorage.multiRemove([TRADES_KEY, SETTINGS_KEY]);
    return true;
  } catch (e) {
    console.warn('Failed to wipe data', e);
    return false;
  }
}
