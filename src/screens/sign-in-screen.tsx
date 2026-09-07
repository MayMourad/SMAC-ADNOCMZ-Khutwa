/**
 * SignInScreen — shown by <AuthOverlay> when nobody is signed in.
 * Email/password or a one-tap anonymous account. Success is picked up by
 * useAuth via onAuthStateChanged; this screen doesn't navigate.
 */

import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { FadeIn } from '@/components/fade-in';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/card';
import { LanguageToggle } from '@/components/language-toggle';
import { PillButton } from '@/components/pill-button';
import { PressableScale } from '@/components/pressable-scale';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Radii, Spacing } from '@/constants/theme';
import { useLang } from '@/i18n';
import { useTheme } from '@/hooks/use-theme';
import { signInAnon, signInWithEmail, signUpWithEmail } from '@/services/firebase';

type Mode = 'sign-in' | 'sign-up';

export function SignInScreen() {
  const theme = useTheme();
  const { t } = useLang();
  const [mode, setMode] = useState<Mode>('sign-in');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError((e as Error).message.replace('Firebase: ', ''));
    } finally {
      setBusy(false);
    }
  };

  const submit = () =>
    run(() =>
      mode === 'sign-in'
        ? signInWithEmail(email, password)
        : signUpWithEmail(email, password, name),
    );

  const input = (
    props: React.ComponentProps<typeof TextInput>,
  ) => (
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
          <ThemedText type="display" ltr>
            {t('app.name')}
          </ThemedText>
          <ThemedText type="bodySerif" color="textSecondary">
            {t('app.tagline')}
          </ThemedText>
        </FadeIn>

        <FadeIn delay={80} style={{ width: '100%', alignItems: 'center' }}>
          <Card style={styles.card}>
            <View style={styles.modeRow}>
              {(['sign-in', 'sign-up'] as Mode[]).map((m) => (
                <PressableScale key={m} haptic={false} activeScale={0.96} onPress={() => setMode(m)}>
                  <ThemedText
                    type="subtitle"
                    style={{ color: mode === m ? theme.text : theme.textMuted }}>
                    {m === 'sign-in' ? t('auth.signIn') : t('auth.createAccount')}
                  </ThemedText>
                </PressableScale>
              ))}
            </View>

            {mode === 'sign-up' &&
              input({ value: name, onChangeText: setName, placeholder: t('auth.name') })}
            {input({
              value: email,
              onChangeText: setEmail,
              placeholder: t('auth.email'),
              autoCapitalize: 'none',
              keyboardType: 'email-address',
            })}
            {input({
              value: password,
              onChangeText: setPassword,
              placeholder: t('auth.password'),
              secureTextEntry: true,
            })}

            {error && (
              <ThemedText type="small" style={{ color: theme.danger }}>
                {error}
              </ThemedText>
            )}

            <PillButton
              full
              label={mode === 'sign-in' ? t('auth.signIn') : t('auth.createAccount')}
              onPress={submit}
              loading={busy}
            />
            <PressableScale haptic={false} onPress={() => run(signInAnon)} style={styles.ghost}>
              <ThemedText type="callout" color="textMuted">
                {t('auth.continueAnon')}
              </ThemedText>
            </PressableScale>
          </Card>
        </FadeIn>

        <View style={styles.footer}>
          <LanguageToggle compact />
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    gap: Spacing.five,
  },
  header: { alignItems: 'center', gap: Spacing.two },
  card: { alignSelf: 'stretch', gap: Spacing.three },
  modeRow: { flexDirection: 'row', gap: Spacing.four, justifyContent: 'center', marginBottom: Spacing.one },
  input: {
    borderWidth: 1,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: 14,
    fontSize: 16,
  },
  ghost: { alignSelf: 'center', paddingVertical: Spacing.two },
  footer: { position: 'absolute', bottom: Spacing.five, alignSelf: 'center' },
});
