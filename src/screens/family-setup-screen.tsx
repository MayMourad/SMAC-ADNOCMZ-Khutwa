/**
 * FamilySetupScreen — shown by <AuthOverlay> when signed in but not in a family.
 * Start a new family (become guardian) or join by invite code. On success calls
 * onDone() so the gate re-checks.
 */

import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { FadeIn } from '@/components/fade-in';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/card';
import { PillButton } from '@/components/pill-button';
import { PressableScale } from '@/components/pressable-scale';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Radii, Spacing } from '@/constants/theme';
import { useLang } from '@/i18n';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { bootstrapFamily, joinFamilyByCode, signOutUser } from '@/services/firebase';

export function FamilySetupScreen({ onDone }: { onDone: () => void }) {
  const theme = useTheme();
  const { t } = useLang();
  const { user } = useAuth();
  const [name, setName] = useState(user?.displayName ?? '');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (fn: () => Promise<unknown>) => {
    if (!user) return;
    setBusy(true);
    setError(null);
    try {
      await fn();
      onDone();
    } catch (e) {
      setError((e as Error).message.replace('Firebase: ', ''));
    } finally {
      setBusy(false);
    }
  };

  const field = (props: React.ComponentProps<typeof TextInput>) => (
    <TextInput
      placeholderTextColor={theme.textMuted}
      style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.backgroundAlt }]}
      {...props}
    />
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <FadeIn style={styles.header}>
          <ThemedText type="title">{t('setup.title')}</ThemedText>
          <ThemedText type="body" color="textSecondary" style={styles.center}>
            {t('setup.subtitle')}
          </ThemedText>
        </FadeIn>

        <FadeIn delay={80} style={styles.stack}>
          <Card style={styles.card}>
            <ThemedText type="heading">{t('setup.startNew')}</ThemedText>
            {field({ value: name, onChangeText: setName, placeholder: t('auth.name') })}
            <PillButton
              full
              label={t('setup.createFamily')}
              onPress={() => run(() => bootstrapFamily(user!.uid, name))}
              loading={busy}
            />
          </Card>

          <Card style={styles.card}>
            <ThemedText type="heading">{t('setup.joinWithCode')}</ThemedText>
            {field({
              value: code,
              onChangeText: setCode,
              placeholder: t('setup.codePlaceholder'),
              autoCapitalize: 'characters',
            })}
            <PillButton
              full
              variant="outline"
              label={t('setup.joinFamily')}
              onPress={() => run(() => joinFamilyByCode(code, user!.uid, name))}
              disabled={!code.trim()}
            />
          </Card>

          {error && (
            <ThemedText type="small" style={{ color: theme.danger }}>
              {error}
            </ThemedText>
          )}

          <PressableScale haptic={false} onPress={() => signOutUser()} style={styles.ghost}>
            <ThemedText type="callout" color="textMuted">
              {t('common.signOut')}
            </ThemedText>
          </PressableScale>
        </FadeIn>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: {
    flex: 1,
    justifyContent: 'center',
    alignSelf: 'center',
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    gap: Spacing.four,
  },
  header: { alignItems: 'center', gap: Spacing.two, marginBottom: Spacing.two },
  center: { textAlign: 'center' },
  stack: { gap: Spacing.three },
  card: { gap: Spacing.three },
  input: {
    borderWidth: 1,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: 14,
    fontSize: 16,
  },
  ghost: { alignSelf: 'center', paddingVertical: Spacing.two },
});
