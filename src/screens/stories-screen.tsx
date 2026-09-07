/**
 * StoriesScreen (tab: Stories)
 * ============================
 *
 * The log of location memories. Unlocked ones show their narration (serif) and
 * a play button (device TTS). Locked ones point you where to walk.
 */

import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { FadeIn } from '@/components/fade-in';
import { BookLock, Play, Square } from 'lucide-react-native';

import { Card } from '@/components/card';
import { PressableScale } from '@/components/pressable-scale';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing } from '@/constants/theme';
import { storyLang, useLang } from '@/i18n';
import { useMemories } from '@/hooks/use-memories';
import { useTheme } from '@/hooks/use-theme';
import { narrate, stopNarration } from '@/services/speech';

export function StoriesScreen() {
  const theme = useTheme();
  const { t, lang } = useLang();
  const memories = useMemories();
  const [playingId, setPlayingId] = useState<string | null>(null);

  const play = (id: string, text: string) => {
    if (playingId === id) {
      stopNarration();
      setPlayingId(null);
      return;
    }
    setPlayingId(id);
    narrate(text, { language: storyLang(lang), onDone: () => setPlayingId(null) });
  };

  const unlockedCount = memories.filter((m) => m.unlockedAt).length;

  return (
    <Screen wash="accent">
      <FadeIn style={{ gap: 4 }}>
        <ThemedText type="title">{t('stories.title')}</ThemedText>
        <ThemedText type="callout" color="textMuted">
          {t('stories.progress', { n: unlockedCount, total: memories.length })}
        </ThemedText>
      </FadeIn>

      {memories.map((m, i) => {
        const unlocked = !!m.unlockedAt;
        const playing = playingId === m.id;
        return (
          <FadeIn key={m.id} delay={60 + i * 50}>
            <Card variant={unlocked ? 'elevated' : 'flat'} style={styles.card}>
              <View style={styles.head}>
                <ThemedText type="heading">{m.label}</ThemedText>
                <View
                  style={[
                    styles.chip,
                    {
                      backgroundColor: unlocked ? theme.primary : theme.backgroundAlt,
                    },
                  ]}>
                  <ThemedText
                    type="label"
                    uppercase
                    style={{ color: unlocked ? theme.onPrimary : theme.textMuted }}>
                    {unlocked ? t('stories.unlocked') : t('stories.locked')}
                  </ThemedText>
                </View>
              </View>

              {unlocked ? (
                <>
                  <ThemedText type="bodySerif" color="textSecondary">
                    {m.storyText || m.heritageAngle}
                  </ThemedText>
                  <PressableScale
                    onPress={() => play(m.id, m.storyText || m.heritageAngle)}
                    style={[styles.play, { backgroundColor: theme.text }]}>
                    {playing ? (
                      <Square size={15} color={theme.background} fill={theme.background} />
                    ) : (
                      <Play size={15} color={theme.background} fill={theme.background} />
                    )}
                    <ThemedText type="callout" style={{ color: theme.background }}>
                      {playing ? t('stories.stop') : t('stories.play')}
                    </ThemedText>
                  </PressableScale>
                </>
              ) : (
                <View style={styles.lockedRow}>
                  <BookLock size={16} color={theme.textMuted} />
                  <ThemedText type="small" color="textMuted" style={{ flex: 1 }}>
                    {t('stories.lockedHint', { place: m.label })}
                  </ThemedText>
                </View>
              )}
            </Card>
          </FadeIn>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { alignSelf: 'stretch', gap: Spacing.two },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chip: { paddingHorizontal: Spacing.two, paddingVertical: 4, borderRadius: Radii.pill },
  play: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    alignSelf: 'flex-start',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: Radii.pill,
    marginTop: Spacing.one,
  },
  lockedRow: { flexDirection: 'row', gap: Spacing.two, alignItems: 'center' },
});
