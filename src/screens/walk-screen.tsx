/**
 * WalkScreen  (tab: Walk)
 * =======================
 *
 * Active tracking during a walk:
 *   - live step count for this device (foreground pedometer)
 *   - geofencing over the curated locations; entering one narrates its story
 *     and unlocks the memory
 *   - a "We're together" check-in that blooms the shared tree
 *   - a manual step entry so the demo works even where the pedometer can't read
 *
 * This screen wires the services together but keeps the logic thin and readable
 * so either teammate can walk a judge through it.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { CURATED_LOCATIONS, getLocation } from '@/data/locations';
import { useAuth } from '@/hooks/use-auth';
import { useFamily } from '@/hooks/use-family';
import { useTheme } from '@/hooks/use-theme';
import { useTreeState } from '@/hooks/use-tree-state';
import {
  onEnterRegion,
  requestPermissions,
  startGeofencing,
  stopGeofencing,
  type MemoryRegion,
} from '@/services/location';
import { getStory } from '@/services/llm';
import { narrate, stopNarration } from '@/services/speech';
import { manualSteps, watchSteps } from '@/services/steps';

const REGIONS: MemoryRegion[] = CURATED_LOCATIONS.map((l) => ({
  locationId: l.id,
  latitude: l.lat,
  longitude: l.lng,
  radius: l.radiusM,
}));

export function WalkScreen() {
  const theme = useTheme();
  const { user } = useAuth();
  const { family } = useFamily(user?.uid ?? null);
  const { tree, bloom } = useTreeState(family?.id ?? null);

  const [walking, setWalking] = useState(false);
  const [liveSteps, setLiveSteps] = useState(0);
  const [status, setStatus] = useState('Ready.');
  const [manual, setManual] = useState('');
  const stopWatchRef = useRef<null | (() => void)>(null);

  // --- geofence enter -> narrate + unlock -----------------------------------
  useEffect(() => {
    if (!walking) return;
    const unsub = onEnterRegion(async (locationId) => {
      const place = getLocation(locationId);
      if (!place) return;
      setStatus(`You've reached ${place.label}.`);

      const story = await getStory(locationId, {
        familyName: family ? `the ${family.members[0]?.displayName ?? ''} family` : 'the family',
        presentMembers: family?.members.map((m) => m.displayName) ?? [],
        language: 'en-AE',
      });
      narrate(story.text, { onDone: () => setStatus('Story finished.') });

      // First device to arrive unlocks it for the whole family.
      if (family && user) {
        const svc = await import('@/services/firebase').catch(() => null);
        await svc?.unlockMemory(locationId, user.uid).catch(() => {});
      }
    });
    return unsub;
  }, [walking, family, user]);

  // --- start / stop a walk -------------------------------------------------
  const startWalk = useCallback(async () => {
    setStatus('Asking for location permission…');
    const perm = await requestPermissions({ background: true });
    if (!perm.foreground) {
      setStatus('Location permission denied — geofencing is off.');
    } else {
      await startGeofencing(REGIONS);
      setStatus(
        perm.background
          ? 'Walk started. Geofencing active in the background.'
          : 'Walk started. Geofencing active while the app is open.',
      );
    }
    stopWatchRef.current = watchSteps(setLiveSteps);
    setWalking(true);
  }, []);

  const endWalk = useCallback(async () => {
    stopWatchRef.current?.();
    stopWatchRef.current = null;
    await stopGeofencing();
    stopNarration();
    setWalking(false);
    setStatus('Walk ended.');
  }, []);

  useEffect(() => () => void endWalk(), [endWalk]);

  // --- manual step entry (testing / demo) --------------------------------
  const submitManual = useCallback(async () => {
    const n = parseInt(manual, 10);
    if (!Number.isFinite(n) || n <= 0 || !family || !user) return;
    const entry = manualSteps(user.uid, n);
    const svc = await import('@/services/firebase').catch(() => null);
    await svc?.syncDailySteps(family.id, entry).catch(() => {});
    setStatus(`Logged ${n} steps for ${user.displayName}.`);
    setManual('');
  }, [manual, family, user]);

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <SafeAreaView style={styles.inner}>
          <ThemedText type="subtitle">Walk</ThemedText>

          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText type="smallBold">Steps this walk</ThemedText>
            <ThemedText type="title">{liveSteps}</ThemedText>
            <Pressable
              onPress={walking ? endWalk : startWalk}
              style={({ pressed }) => [
                styles.button,
                { backgroundColor: theme.text, opacity: pressed ? 0.7 : 1 },
              ]}>
              <ThemedText type="smallBold" style={{ color: theme.background }}>
                {walking ? 'End walk' : 'Start walk'}
              </ThemedText>
            </Pressable>
            <ThemedText type="small" themeColor="textSecondary">
              {status}
            </ThemedText>
          </ThemedView>

          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText type="smallBold">Together</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              When you&apos;re walking as a family, check in together to make the tree bloom.
            </ThemedText>
            <Pressable
              onPress={() => {
                bloom(!tree?.isBlooming);
                setStatus(tree?.isBlooming ? 'Bloom cleared.' : 'The tree is blooming 🌸');
              }}
              style={({ pressed }) => [
                styles.button,
                { backgroundColor: theme.backgroundSelected, opacity: pressed ? 0.7 : 1 },
              ]}>
              <ThemedText type="smallBold">
                {tree?.isBlooming ? "We're done" : "We're together"}
              </ThemedText>
            </Pressable>
          </ThemedView>

          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText type="smallBold">Log steps manually</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              For testing where the pedometer can&apos;t read history (e.g. Android).
            </ThemedText>
            <View style={styles.manualRow}>
              <TextInput
                value={manual}
                onChangeText={setManual}
                keyboardType="number-pad"
                placeholder="e.g. 2500"
                placeholderTextColor={theme.textSecondary}
                style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
              />
              <Pressable
                onPress={submitManual}
                style={({ pressed }) => [
                  styles.button,
                  { backgroundColor: theme.text, opacity: pressed ? 0.7 : 1 },
                ]}>
                <ThemedText type="smallBold" style={{ color: theme.background }}>
                  Log
                </ThemedText>
              </Pressable>
            </View>
          </ThemedView>
        </SafeAreaView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: {
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.five,
  },
  inner: {
    width: '100%',
    maxWidth: MaxContentWidth,
    gap: Spacing.four,
    paddingTop: Spacing.four,
  },
  card: {
    alignSelf: 'stretch',
    padding: Spacing.four,
    borderRadius: Spacing.four,
    gap: Spacing.two,
  },
  button: {
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.three,
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: Spacing.one,
  },
  manualRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
});
