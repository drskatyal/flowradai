import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors, typography, radius } from '../../src/theme';

type IconName = keyof typeof Ionicons.glyphMap;

function TabIcon({ name, focused, label }: { name: IconName; focused: boolean; label: string }) {
  const active = name.replace('-outline', '') as IconName;
  return (
    <View style={[t.wrap, focused && t.wrapActive]}>
      <Ionicons
        name={focused ? active : name}
        size={20}
        color={focused ? colors.primaryLight : colors.textMuted}
      />
    </View>
  );
}

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: t.bar,
        tabBarBackground: () =>
          Platform.OS === 'ios'
            ? <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill} />
            : <View style={[StyleSheet.absoluteFill, t.barAndroid]} />,
        tabBarActiveTintColor: colors.primaryLight,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: t.label,
        tabBarItemStyle: t.item,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Workspace', tabBarIcon: ({ focused }) => <TabIcon name="mic-outline" focused={focused} label="Workspace" /> }} />
      <Tabs.Screen name="templates" options={{ title: 'Templates', tabBarIcon: ({ focused }) => <TabIcon name="document-text-outline" focused={focused} label="Templates" /> }} />
      <Tabs.Screen name="macros" options={{ title: 'Macros', tabBarIcon: ({ focused }) => <TabIcon name="bookmark-outline" focused={focused} label="Macros" /> }} />
      <Tabs.Screen name="history" options={{ title: 'History', tabBarIcon: ({ focused }) => <TabIcon name="time-outline" focused={focused} label="History" /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ focused }) => <TabIcon name="person-outline" focused={focused} label="Profile" /> }} />
    </Tabs>
  );
}

const t = StyleSheet.create({
  bar: {
    position: 'absolute',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.07)',
    backgroundColor: Platform.OS === 'ios' ? 'transparent' : colors.bg,
    height: 78,
    paddingBottom: 14,
    paddingTop: 8,
  },
  barAndroid: {
    backgroundColor: colors.bg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.07)',
  },
  item: { paddingTop: 4 },
  wrap: {
    width: 40, height: 34, borderRadius: radius.md,
    alignItems: 'center', justifyContent: 'center',
  },
  wrapActive: { backgroundColor: colors.primarySoft },
  label: { fontSize: typography.xs, fontWeight: typography.medium, marginTop: 2 },
});
