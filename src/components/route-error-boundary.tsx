/**
 * RouteErrorBoundary — re-exported from src/app/_layout.tsx as `ErrorBoundary`.
 * expo-router shows this instead of a blank screen when a route throws.
 */

import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PillButton } from '@/components/pill-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radii, Spacing } from '@/constants/theme';
import { useLang } from '@/i18n';
import { useTheme } from '@/hooks/use-theme';

export function RouteErrorBoundary({
  error,
  retry,
}: {
  error: Error;
  retry: () => Promise<void>;
}) {
  const theme = useTheme();
  const { t } = useLang();
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.inner}>
        <ThemedText type="title">{t('common.somethingWrong')}</ThemedText>
        <ThemedText type="body" color="textSecondary">
          {t('common.errorBody')}
        </ThemedText>
        <ScrollView style={[styles.box, { backgroundColor: theme.backgroundAlt }]}>
          <ThemedText type="mono" color="textMuted">
            {error?.message ?? 'Unknown error'}
          </ThemedText>
        </ScrollView>
        <PillButton label={t('common.retry')} onPress={() => retry()} variant="outline" />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, justifyContent: 'center', padding: Spacing.four, gap: Spacing.three },
  box: { maxHeight: 180, padding: Spacing.three, borderRadius: Radii.md },
});
