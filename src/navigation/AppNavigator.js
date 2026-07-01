import React from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';
import { colors } from '../theme/colors';

import DashboardScreen from '../screens/DashboardScreen';
import JournalScreen from '../screens/JournalScreen';
import AddEditTradeScreen from '../screens/AddEditTradeScreen';
import ChecklistScreen from '../screens/ChecklistScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import ExportScreen from '../screens/ExportScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();
const JournalStack = createNativeStackNavigator();

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.background,
    card: colors.surface,
    border: colors.border,
    primary: colors.gold,
    text: colors.textPrimary,
  },
};

const ICONS = {
  Dashboard: '◆',
  Journal: '☰',
  Checklist: '✓',
  Analytics: '▲',
  Export: '⇩',
  Settings: '⚙',
};

function TabIcon({ label, focused }) {
  return (
    <Text style={{ fontSize: 18, color: focused ? colors.gold : colors.textMuted }}>
      {ICONS[label] || '•'}
    </Text>
  );
}

function JournalStackNavigator() {
  return (
    <JournalStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.gold,
        headerTitleStyle: { color: colors.textPrimary },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <JournalStack.Screen
        name="JournalList"
        component={JournalScreen}
        options={{ title: 'Trade Journal' }}
      />
      <JournalStack.Screen
        name="AddEditTrade"
        component={AddEditTradeScreen}
        options={({ route }) => ({
          title: route.params?.tradeId ? 'Edit Trade' : 'Add Trade',
          presentation: 'modal',
        })}
      />
    </JournalStack.Navigator>
  );
}

function DashboardStackNavigator() {
  return (
    <JournalStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.gold,
        headerTitleStyle: { color: colors.textPrimary },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <JournalStack.Screen
        name="DashboardHome"
        component={DashboardScreen}
        options={{ title: 'ICT Adaptive Bot Pro' }}
      />
      <JournalStack.Screen
        name="AddEditTrade"
        component={AddEditTradeScreen}
        options={({ route }) => ({
          title: route.params?.tradeId ? 'Edit Trade' : 'Add Trade',
          presentation: 'modal',
        })}
      />
    </JournalStack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer theme={navTheme}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            height: 62,
            paddingBottom: 8,
            paddingTop: 6,
          },
          tabBarActiveTintColor: colors.gold,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
          tabBarIcon: ({ focused }) => <TabIcon label={route.name} focused={focused} />,
        })}
      >
        <Tab.Screen name="Dashboard" component={DashboardStackNavigator} />
        <Tab.Screen name="Journal" component={JournalStackNavigator} />
        <Tab.Screen name="Checklist" component={ChecklistScreen} />
        <Tab.Screen name="Analytics" component={AnalyticsScreen} />
        <Tab.Screen name="Export" component={ExportScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
