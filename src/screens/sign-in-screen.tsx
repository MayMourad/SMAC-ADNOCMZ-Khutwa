/**
 * SignInScreen — shown by <AuthOverlay> after the landing screen.
 * A compact oasis scene up top, the form card floating over the warm ground.
 * Email/password or a one-tap anonymous account; success is picked up by
 * useAuth via onAuthStateChanged. `onBack` returns to the landing screen.
 */

import { ChevronLeft } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/card';
import { FadeIn } from '@/components/fade-in';
import { LanguageToggle } from '@/components/language-toggle';
import { OasisScene } from '@/components/oasis-scene';
import { PillButton } from '@/components/pill-button';
import { PressableScale } from '@/components/pressable-scale';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Radii, Spacing } from '@/constants/theme';
import { useLang } from '@/i18n';
import { useTheme } from '@/hooks/use-theme';
import { signInAnon, signInWithEmail, signUpWithEmail } from '@/services/firebase';

type Mode = 'sign-in' | 'sign-up';

export function SignInScreen({ onBack }: { onBack?: () => void }) {
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

  const input = (props: React.ComponentProps<typeof TextInput>) => (
    <TextInput
      placeholderTextColor={theme.textMuted}
      style={[
        styles.input,
        { color: theme.text, borderColor: theme.border, backgroundColor: theme.backgroundAlt },
      ]}
      {...props}
    />
  );

  return (
    <ThemedView style={styles.container}>
      <OasisScene mood="dawn" stage="young" height={230} treeSize={150} style={styles.scene} />

      {onBack && (
        <SafeAreaView style={styles.backWrap}>
          <PressableScale haptic={false} onPress={onBack} style={styles.back}>
            <ChevronLeft size={18} color={theme.text} />
            <ThemedText type="callout">{t('auth.back')}</ThemedText>
          </PressableScale>
        </SafeAreaView>
      )}

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.inner}>
          <FadeIn style={styles.header}>
            <ThemedText type="title" ltr>
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
                  <PressableScale
                    key={m}
                    haptic={false}
                    activeScale={0.96}
                    onPress={() => setMode(m)}>
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

          <LanguageToggle compact />
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scene: { position: 'absolute', top: 0, left: 0, right: 0 },
  backWrap: { position: 'absolute', top: 0, left: 0, zIndex: 10 },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingVertical: Spacing.five },
  inner: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    gap: Spacing.four,
    marginTop: 210,
  },
  header: { alignItems: 'center', gap: Spacing.one },
  card: { alignSelf: 'stretch', gap: Spacing.three },
  modeRow: {
    flexDirection: 'row',
    gap: Spacing.four,
    justifyContent: 'center',
    marginBottom: Spacing.one,
  },
  input: {
    borderWidth: 1,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: 14,
    fontSize: 16,
  },
  ghost: { alignSelf: 'center', paddingVertical: Spacing.two },
});
