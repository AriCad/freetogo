import '../src/i18n';
import React, { useEffect } from 'react';
import { View } from 'react-native';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, Figtree_400Regular, Figtree_500Medium, Figtree_600SemiBold, Figtree_700Bold } from '@expo-google-fonts/figtree';
import { ThemeProvider, useTheme } from '@freetogo/ui';
import { SettingsProvider, useSettings } from '../src/settings/Settings';
import { AppStoreProvider, useStore } from '../src/state/AppStore';
import { AlertBanner, Toast } from '../src/components/Overlays';
import { onNotificationTap } from '../src/services/notifications';

void SplashScreen.preventAutoHideAsync().catch(() => undefined);

function Shell() {
  const { colors } = useTheme();
  const { ready } = useStore();
  const settings = useSettings();
  useEffect(() => {
    if (ready && settings.loaded) void SplashScreen.hideAsync().catch(() => undefined);
  }, [ready, settings.loaded]);
  useEffect(() => onNotificationTap((data) => typeof data.href === 'string' && router.push(data.href as never)), []);
  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.surface } }}>
        <Stack.Screen name="(collector)" />
        <Stack.Screen name="(merchant)" />
        {['location', 'filters', 'theme', 'language'].map((n) => <Stack.Screen key={n} name={n} options={{ presentation: 'modal' }} />)}
      </Stack>
      <AlertBanner />
      <Toast />
    </View>
  );
}

function Themed() {
  const { theme } = useSettings();
  return (
    <ThemeProvider themeId={theme}>
      <AppStoreProvider>
        <Shell />
      </AppStoreProvider>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ Figtree_400Regular, Figtree_500Medium, Figtree_600SemiBold, Figtree_700Bold });
  if (!fontsLoaded) return null;
  return (
    <SafeAreaProvider>
      <SettingsProvider>
        <Themed />
      </SettingsProvider>
    </SafeAreaProvider>
  );
}
