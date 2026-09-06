/**
 * StoriesScreen  (tab: Stories)
 * =============================
 *
 * The log of location memories. Unlocked ones show their narration text and a
 * Play button (device text-to-speech). Locked ones show where to go to unlock.
 *
 * Reads from `useMemories()` — mock list until Firestore is seeded, then live.
 */

import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useMemories } from '@/hooks/use-memories';
import { useTheme } from '@/hooks/use-theme';
import { narrate, stopNarration } from '@/services/speech';

export function StoriesScreen() {
  const theme = useTheme();
  const memories = useMemories();
  const [playingId, setPlayingId] = useState<string | null>(null);

  const play = (id: string, text: string) => {
    if (playingId === id) {
      stopNarration();
      setPlayingId(null);
      return;
    }
    setPlayingId(id);
    narrate(text, { onDone: () => setPlayingId(null) });
  };

  const unlockedCount = memories.filter((m) => m.unlockedAt).length;

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <SafeAreaView style={styles.inner}>
          <ThemedText type="subtitle">Stories</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {unlockedCount} of {memories.length} family places unlocked
          </ThemedText>

          {memories.map((m) => {
            const unlocked = !!m.unlockedAt;
            return (
              <ThemedView key={m.id} type="backgroundElement" style={styles.card}>
                <View style={styles.cardHead}>
                  <ThemedText type="smallBold">{m.label}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {unlocked ? 'Unlocked' : 'Locked'}
                  </ThemedText>
                </View>

                {unlocked ? (
                  <>
                    <ThemedText type="small">{m.storyText || m.heritageAngle}</ThemedText>
                    <Pressable
                      onPress={() => play(m.id, m.storyText || m.heritageAngle)}
                      style={({ pressed }) => [
                        styles.button,
                        { backgroundColor: theme.text, opacity: pressed ? 0.7 : 1 },
                      ]}>
                      <ThemedText type="smallBold" style={{ color: theme.background }}>
                        {playingId === m.id ? 'Stop' : 'Play story'}
                      </ThemedText>
                    </Pressable>
                  </>
                ) : (
                  <ThemedText type="small" themeColor="textSecondary">
                    Walk near {m.label} together to unlock this story.
                  </ThemedText>
                )}
              </ThemedView>
            );
          })}
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
    gap: Spacing.three,
    paddingTop: Spacing.four,
  },
  card: {
    alignSelf: 'stretch',
    padding: Spacing.four,
    borderRadius: Spacing.four,
    gap: Spacing.two,
  },
  cardHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  button: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.three,
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: Spacing.one,
  },
});
