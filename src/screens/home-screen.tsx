/**
 * HomeScreen  (tab: Home)
 * =======================
 *
 * The shared Ghaf tree and the family's Khutwa Score. This is the screen the
 * home-widget mirrors, so it stays calm and glanceable: tree, one big number,
 * three sub-scores, and how many location memories are unlocked.
 *
 * Data flow:  useAuth -> useFamily(uid) -> useTreeState(familyId)
 * When Firebase isn't configured these hooks return mock data (see src/data/mock.ts),
 * so this screen renders fully during UI development.
 */

import { useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GhafTree } from '@/components/ghaf-tree';
import { ScoreBar } from '@/components/score-bar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useFamily } from '@/hooks/use-family';
import { useMemories } from '@/hooks/use-memories';
import { useTreeState } from '@/hooks/use-tree-state';
import { recomputeTree } from '@/services/scoreSync';

export function HomeScreen() {
  const { user } = useAuth();
  const { family } = useFamily(user?.uid ?? null);
  const { tree } = useTreeState(family?.id ?? null);
  const memories = useMemories();

  // Refresh the score from the week's activity whenever Home opens.
  useEffect(() => {
    if (family?.id) recomputeTree(family.id).catch(() => {});
  }, [family?.id]);

  const unlocked = memories.filter((m) => m.unlockedAt).length;

  if (!family || !tree) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText type="small" themeColor="textSecondary">
          Loading your family tree…
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <SafeAreaView style={styles.inner}>
          <ThemedText type="small" themeColor="textSecondary">
            {family.members.map((m) => m.displayName).join(' · ')}
          </ThemedText>

          <GhafTree stage={tree.growthStage} blooming={tree.isBlooming} size={200} />

          <ThemedView type="backgroundElement" style={styles.card}>
            <ScoreBar label="Khutwa Score" value={tree.khutwaScore} emphasis />
            <View style={styles.subScores}>
              <ScoreBar label="Root · health" value={tree.rootScore} />
              <ScoreBar label="Bloom · bonding" value={tree.bloomScore} />
              <ScoreBar label="Heritage · culture" value={tree.heritageScore} />
            </View>
          </ThemedView>

          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText type="smallBold">Memories unlocked</ThemedText>
            <ThemedText type="title">
              {unlocked}
              <ThemedText type="small" themeColor="textSecondary">
                {' '}
                / {memories.length}
              </ThemedText>
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Walk near a family place to unlock its story.
            </ThemedText>
          </ThemedView>
        </SafeAreaView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: {
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.five,
  },
  inner: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignItems: 'center',
    gap: Spacing.four,
    paddingTop: Spacing.four,
  },
  card: {
    alignSelf: 'stretch',
    padding: Spacing.four,
    borderRadius: Spacing.four,
    gap: Spacing.three,
  },
  subScores: {
    gap: Spacing.three,
  },
});
