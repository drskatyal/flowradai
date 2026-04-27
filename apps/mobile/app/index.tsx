import { useEffect } from 'react';
import { router } from 'expo-router';
import { useAppStore } from '../src/stores/appStore';
import { View, ActivityIndicator } from 'react-native';
import { colors } from '../src/theme';

export default function IndexScreen() {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const hasCompletedOnboarding = useAppStore((s) => s.hasCompletedOnboarding);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isAuthenticated) {
        router.replace('/(auth)/sign-in');
      } else if (!hasCompletedOnboarding) {
        router.replace('/(onboarding)/welcome');
      } else {
        router.replace('/(app)');
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [isAuthenticated, hasCompletedOnboarding]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color={colors.primaryLight} size="large" />
    </View>
  );
}
