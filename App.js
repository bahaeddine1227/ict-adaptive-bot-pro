import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { TradeProvider } from './src/context/TradeContext';
import AppNavigator from './src/navigation/AppNavigator';
import { colors } from './src/theme/colors';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaProvider>
        <TradeProvider>
          <StatusBar style="light" backgroundColor={colors.background} />
          <AppNavigator />
        </TradeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
