/**
 * LandingScreen
 * =============
 *
 * The first thing a logged-out person sees. An illustrated oasis fills the top
 * third — gradient sky, low sun, layered dunes, the Ghaf tree on the front
 * dune. The wordmark, three value lines and the way in sit on the solid ground
 * below it.
 *
 * Shown by <AuthOverlay> before the sign-in screen; "Get started" advances.
 */

import * as Haptics from 'expo-haptics';
import { Sparkles, Footprints, BookOpen } from 'lucide-react-native';
import { useCallback, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

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

const SCENE_H = 300;

export function LandingScreen({ onGetStarted }: { onGetStarted: () => void }) {
  const theme = useTheme();
  const { t } = useLang();

  // scroll position drives the dusk -> night shift in the scene behind the sheet
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.set(e.contentOffset.y);
  });

  // tap the tree crown -> it blooms for a few seconds
  const [bloomed, setBloomed] = useState(false);
  const bloomTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bloomTree = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
    setBloomed(true);
    if (bloomTimer.current) clearTimeout(bloomTimer.current);
    bloomTimer.current = setTimeout(() => setBloomed(false), 3600);
  }, []);

  const values = [
    { Icon: Footprints, key: 'value1' },
    { Icon: BookOpen, key: 'value2' },
    { Icon: Sparkles, key: 'value3' },
  ] as const;

  return (
    <ThemedView style={styles.container}>
      <OasisScene
        mood="dusk"
        stage="mature"
        height={SCENE_H}
        treeSize={170}
        scrollY={scrollY}
        nightAt={170}
        blooming={bloomed}
        style={styles.scene}
      />

      {/* invisible tap-zone over the visible crown — sits above the scroll view */}
      <Pressable
        style={styles.treeTapZone}
        onPress={bloomTree}
        accessibilityRole="button"
        accessibilityLabel={t('landing.tap_tree')}
      />

      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>
        {/* solid sheet that starts just under the tree */}
        <ThemedView style={[styles.sheet, { borderColor: theme.border }]}>
          <SafeAreaView>
            <View style={styles.inner}>
              <FadeIn delay={60} style={styles.header}>
                <ThemedText type="display" ltr>
                  {t('app.name')}
                </ThemedText>
                <ThemedText type="bodySerif" color="textSecondary">
                  {t('app.tagline')}
                </ThemedText>
              </FadeIn>

              <FadeIn delay={140} style={styles.values}>
                {values.map(({ Icon, key }) => (
                  <View key={key} style={styles.valueRow}>
                    <View style={[styles.valueIcon, { backgroundColor: theme.backgroundAlt }]}>
                      <Icon size={17} color={theme.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <ThemedText type="callout">{t(`landing.${key}.title`)}</ThemedText>
                      <ThemedText type="small" color="textMuted">
                        {t(`landing.${key}.body`)}
                      </ThemedText>
                    </View>
                  </View>
                ))}
              </FadeIn>

              <FadeIn delay={220} style={styles.cta}>
                <PillButton full label={t('landing.get_started')} onPress={onGetStarted} />
                <PressableScale haptic={false} onPress={onGetStarted} style={styles.ghost}>
                  <ThemedText type="callout" color="textMuted">
                    {t('landing.have_code')}
                  </ThemedText>
                </PressableScale>
              </FadeIn>

              <View style={styles.footer}>
                <LanguageToggle compact />
              </View>
            </View>
          </SafeAreaView>
        </ThemedView>
      </Animated.ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scene: { position: 'absolute', top: 0, left: 0, right: 0 },
  treeTapZone: {
    position: 'absolute',
    top: 165,
    alignSelf: 'center',
    width: 200,
    height: 105,
    zIndex: 20,
  },
  scroll: { flexGrow: 1, paddingTop: SCENE_H - 34 },
  sheet: {
    flex: 1,
    borderTopLeftRadius: Radii.xxl,
    borderTopRightRadius: Radii.xxl,
    borderTopWidth: 1,
    minHeight: 420,
  },
  inner: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.five,
    paddingBottom: Spacing.four,
    gap: Spacing.four,
  },
  header: { alignItems: 'center', gap: Spacing.one },
  values: { gap: Spacing.three },
  valueRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  valueIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cta: { gap: Spacing.one },
  ghost: { alignSelf: 'center', paddingVertical: Spacing.two },
  footer: { alignItems: 'center' },
});
