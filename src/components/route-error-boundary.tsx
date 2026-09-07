/**
 * RouteErrorBoundary
 * ==================
 *
 * Re-exported from src/app/_layout.tsx as `ErrorBoundary`. expo-router renders
 * this instead of a blank screen when a route throws during render. Gives the
 * user (and a judge on demo day) a readable message and a retry button rather
 * than a white screen.
 */

import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export function RouteErrorBoundary({
  error,
  retry,
}: {
  error: Error;
  retry: () => Promise<void>;
}) {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.inner}>
        <ThemedText type="subtitle">Something went wrong</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          The app hit an unexpected error. You can try again — if it keeps
          happening, restart the app.
        </ThemedText>
        <ScrollView style={styles.box}>
          <ThemedText type="code">{error?.message ?? 'Unknown error'}</ThemedText>
        </ScrollView>
        <ThemedText type="link" onPress={() => retry()}>
          Try again
        </ThemedText>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.four,
    gap: Spacing.three,
  },
  box: {
    maxHeight: 200,
    padding: Spacing.three,
    borderRadius: Spacing.two,
  },
});
