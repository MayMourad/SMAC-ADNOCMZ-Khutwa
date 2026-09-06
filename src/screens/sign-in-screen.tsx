/**
 * SignInScreen
 * ============
 *
 * Shown by <AuthGate> when Firebase is configured but nobody is signed in.
 * Two ways in: email/password (so a member can sign in on a 2nd device) or a
 * one-tap anonymous account (fast for the demo).
 *
 * It doesn't navigate anywhere on success — `useAuth()` picks up the new user
 * via onAuthStateChanged and <AuthGate> swaps this screen out.
 */

import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  signInAnon,
  signInWithEmail,
  signUpWithEmail,
} from '@/services/firebase';

type Mode = 'sign-in' | 'sign-up';

export function SignInScreen() {
  const theme = useTheme();
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

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.inner}>
        <View style={styles.header}>
          <ThemedText type="title">Khutwa</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Every step waters the story.
          </ThemedText>
        </View>

        <ThemedView type="backgroundElement" style={styles.card}>
          <View style={styles.modeRow}>
            {(['sign-in', 'sign-up'] as Mode[]).map((m) => (
              <Pressable key={m} onPress={() => setMode(m)} style={styles.modeBtn}>
                <ThemedText
                  type="smallBold"
                  themeColor={mode === m ? 'text' : 'textSecondary'}>
                  {m === 'sign-in' ? 'Sign in' : 'Create account'}
                </ThemedText>
              </Pressable>
            ))}
          </View>

          {mode === 'sign-up' && (
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor={theme.textSecondary}
              style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
            />
          )}
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            placeholderTextColor={theme.textSecondary}
            style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            secureTextEntry
            placeholderTextColor={theme.textSecondary}
            style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
          />

          {error && (
            <ThemedText type="small" style={{ color: '#d9534f' }}>
              {error}
            </ThemedText>
          )}

          <Pressable
            onPress={submit}
            disabled={busy}
            style={({ pressed }) => [
              styles.primaryBtn,
              { backgroundColor: theme.text, opacity: pressed || busy ? 0.7 : 1 },
            ]}>
            {busy ? (
              <ActivityIndicator color={theme.background} />
            ) : (
              <ThemedText type="smallBold" style={{ color: theme.background }}>
                {mode === 'sign-in' ? 'Sign in' : 'Create account'}
              </ThemedText>
            )}
          </Pressable>

          <Pressable onPress={() => run(signInAnon)} disabled={busy} style={styles.ghostBtn}>
            <ThemedText type="link" themeColor="textSecondary">
              Continue without an account
            </ThemedText>
          </Pressable>
        </ThemedView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: {
    flex: 1,
    justifyContent: 'center',
    alignSelf: 'center',
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    gap: Spacing.five,
  },
  header: { alignItems: 'center', gap: Spacing.one },
  card: { padding: Spacing.four, borderRadius: Spacing.four, gap: Spacing.three },
  modeRow: { flexDirection: 'row', gap: Spacing.four, justifyContent: 'center' },
  modeBtn: { paddingVertical: Spacing.one },
  input: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    fontSize: 16,
  },
  primaryBtn: {
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
    alignItems: 'center',
    marginTop: Spacing.one,
  },
  ghostBtn: { alignItems: 'center', paddingVertical: Spacing.two },
});
