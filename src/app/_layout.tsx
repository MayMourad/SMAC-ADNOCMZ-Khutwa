import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { AuthOverlay } from '@/components/auth-gate';
import { FONT_ASSETS } from '@/constants/theme';
import { LanguageProvider } from '@/i18n';

SplashScreen.preventAutoHideAsync();

// expo-router picks up this named export and shows it if a route throws while
// rendering, instead of a blank screen.
export { RouteErrorBoundary as ErrorBoundary } from '@/components/route-error-boundary';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded, fontError] = useFonts(FONT_ASSETS);

  useEffect(() => {
    if (fontsLoaded || fontError) SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <LanguageProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <AnimatedSplashOverlay />
          {/* Tabs stay mounted at all times so routing works on every platform;
              AuthOverlay paints over them until the user is signed in + in a family. */}
          <AppTabs />
          <AuthOverlay />
        </ThemeProvider>
      </LanguageProvider>
    </GestureHandlerRootView>
  );
}
