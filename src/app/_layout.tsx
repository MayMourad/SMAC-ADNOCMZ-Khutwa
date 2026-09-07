import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { AuthOverlay } from '@/components/auth-gate';

SplashScreen.preventAutoHideAsync();

// expo-router picks up this named export and shows it if a route throws while
// rendering, instead of a blank screen.
export { RouteErrorBoundary as ErrorBoundary } from '@/components/route-error-boundary';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      {/* Tabs stay mounted at all times so routing works on every platform;
          AuthOverlay paints over them until the user is signed in + in a family. */}
      <AppTabs />
      <AuthOverlay />
    </ThemeProvider>
  );
}
