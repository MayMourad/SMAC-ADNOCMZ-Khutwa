/**
 * HomeScreen (tab: Tree)
 * ======================
 *
 * The shared Ghaf tree + the Khutwa Score. Calm and glanceable — the screen the
 * home-widget mirrors. Data: useAuth -> useFamily -> useTreeState (+ mock when
 * Firebase isn't configured). Recomputes the score from the week's activity on
 * open.
 */

import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/card';
import { FadeIn } from '@/components/fade-in';
import { GhafTree } from '@/components/ghaf-tree';
import { ScoreBar } from '@/components/score-bar';
import { ScoreRing } from '@/components/score-ring';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useLang } from '@/i18n';
import { useAuth } from '@/hooks/use-auth';
import { useFamily } from '@/hooks/use-family';
import { useMemories } from '@/hooks/use-memories';
import { useTreeState } from '@/hooks/use-tree-state';
import { recomputeTree } from '@/services/scoreSync';

export function HomeScreen() {
  const { t } = useLang();
  const { user } = useAuth();
  const { family } = useFamily(user?.uid ?? null);
  const { tree } = useTreeState(family?.id ?? null);
  const memories = useMemories();

  useEffect(() => {
    if (family?.id) recomputeTree(family.id).catch(() => {});
  }, [family?.id]);

  const unlocked = memories.filter((m) => m.unlockedAt).length;

  if (!family || !tree) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText type="callout" color="textSecondary">
          {t('home.loadingTree')}
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <Screen contentGap={Spacing.four}>
      <FadeIn delay={0} style={styles.familyRow}>
        <ThemedText type="label" color="textMuted" uppercase>
          {family.members.map((m) => m.displayName).join('  ·  ')}
        </ThemedText>
      </FadeIn>

      <FadeIn delay={90} style={styles.hero}>
        <GhafTree stage={tree.growthStage} blooming={tree.isBlooming} size={230} />
        <ThemedText type="bodySerif" color="textSecondary" style={styles.caption}>
          {tree.isBlooming ? t('tree.blooming') : t(`tree.${tree.growthStage}`)}
        </ThemedText>
      </FadeIn>

      <FadeIn delay={180}>
        <Card style={styles.scoreCard}>
          <ScoreRing value={tree.khutwaScore} label={t('home.khutwaScore')} />
          <View style={styles.bars}>
            <ScoreBar
              label={t('home.dim.root')}
              sublabel={t('home.dim.root.sub')}
              value={tree.rootScore}
              tone="primary"
            />
            <ScoreBar
              label={t('home.dim.bloom')}
              sublabel={t('home.dim.bloom.sub')}
              value={tree.bloomScore}
              tone="accent"
            />
            <ScoreBar
              label={t('home.dim.heritage')}
              sublabel={t('home.dim.heritage.sub')}
              value={tree.heritageScore}
              tone="sky"
            />
          </View>
        </Card>
      </FadeIn>

      <FadeIn delay={270}>
        <Card variant="flat" style={styles.memCard}>
          <View>
            <ThemedText type="label" color="textMuted" uppercase>
              {t('home.memories')}
            </ThemedText>
            <ThemedText type="body" color="textSecondary" style={{ marginTop: 2 }}>
              {t('home.memories.hint')}
            </ThemedText>
          </View>
          <ThemedText type="title" ltr>
            {unlocked}
            <ThemedText type="subtitle" color="textMuted" ltr>
              {'  '}
              {t('home.memories.of', { total: memories.length })}
            </ThemedText>
          </ThemedText>
        </Card>
      </FadeIn>
    </Screen>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  familyRow: { alignItems: 'center' },
  hero: { alignItems: 'center', gap: Spacing.two },
  caption: { textAlign: 'center', maxWidth: 300 },
  scoreCard: { alignItems: 'center', gap: Spacing.four },
  bars: { alignSelf: 'stretch', gap: Spacing.three },
  memCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
});
