/**
 * FamilySetupScreen
 * =================
 *
 * Shown by <AuthGate> when a user is signed in but not in a family yet.
 * Either start a new family (you become the guardian) or join an existing one
 * with its invite code. On success it calls `onDone()` so the gate re-checks.
 */

import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { bootstrapFamily, joinFamilyByCode, signOutUser } from '@/services/firebase';

export function FamilySetupScreen({ onDone }: { onDone: () => void }) {
  const theme = useTheme();
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

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.inner}>
        <View style={styles.header}>
          <ThemedText type="subtitle">Your family</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Start a family tree, or join one you were invited to.
          </ThemedText>
        </View>

        <ThemedView type="backgroundElement" style={styles.card}>
          <ThemedText type="smallBold">Start a new family</ThemedText>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor={theme.textSecondary}
            style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
          />
          <Pressable
            onPress={() => run(() => bootstrapFamily(user!.uid, name))}
            disabled={busy}
            style={({ pressed }) => [
              styles.primaryBtn,
              { backgroundColor: theme.text, opacity: pressed || busy ? 0.7 : 1 },
            ]}>
            {busy ? (
              <ActivityIndicator color={theme.background} />
            ) : (
              <ThemedText type="smallBold" style={{ color: theme.background }}>
                Create family
              </ThemedText>
            )}
          </Pressable>
        </ThemedView>

        <ThemedView type="backgroundElement" style={styles.card}>
          <ThemedText type="smallBold">Join with an invite code</ThemedText>
          <TextInput
            value={code}
            onChangeText={setCode}
            autoCapitalize="characters"
            placeholder="GHAF-XXXX"
            placeholderTextColor={theme.textSecondary}
            style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
          />
          <Pressable
            onPress={() => run(() => joinFamilyByCode(code, user!.uid, name))}
            disabled={busy || !code.trim()}
            style={({ pressed }) => [
              styles.secondaryBtn,
              {
                borderColor: theme.text,
                opacity: pressed || busy || !code.trim() ? 0.5 : 1,
              },
            ]}>
            <ThemedText type="smallBold">Join family</ThemedText>
          </Pressable>
        </ThemedView>

        {error && (
          <ThemedText type="small" style={{ color: '#d9534f' }}>
            {error}
          </ThemedText>
        )}

        <Pressable onPress={() => signOutUser()} style={styles.ghostBtn}>
          <ThemedText type="link" themeColor="textSecondary">
            Sign out
          </ThemedText>
        </Pressable>
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
    gap: Spacing.four,
  },
  header: { alignItems: 'center', gap: Spacing.one, marginBottom: Spacing.two },
  card: { padding: Spacing.four, borderRadius: Spacing.four, gap: Spacing.three },
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
  },
  secondaryBtn: {
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
    alignItems: 'center',
    borderWidth: 1,
  },
  ghostBtn: { alignItems: 'center', paddingVertical: Spacing.two },
});
