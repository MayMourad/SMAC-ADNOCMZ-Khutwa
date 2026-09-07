/**
 * WalkScreen (tab: Walk)
 * ======================
 *
 * Active tracking: live step count, geofencing over the curated locations
 * (entering one narrates its story + unlocks it), a "we're together" check-in
 * that blooms the shared tree, and a manual step entry for testing. Wires the
 * services together; the logic stays thin so either teammate can walk a judge
 * through it.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { FadeIn } from '@/components/fade-in';

import { Card } from '@/components/card';
import { PillButton } from '@/components/pill-button';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { isFirebaseConfigured } from '@/config/env';
import { Fonts, Radii, Spacing } from '@/constants/theme';
import { CURATED_LOCATIONS, getLocation } from '@/data/locations';
import { storyLang, useLang } from '@/i18n';
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
import { recomputeTree } from '@/services/scoreSync';
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
  const { t, lang } = useLang();
  const { user } = useAuth();
  const { family } = useFamily(user?.uid ?? null);
  const { tree, bloom } = useTreeState(family?.id ?? null);

  const [walking, setWalking] = useState(false);
  const [liveSteps, setLiveSteps] = useState(0);
  const [status, setStatus] = useState(t('walk.ready'));
  const [manual, setManual] = useState('');
  const stopWatchRef = useRef<null | (() => void)>(null);

  useEffect(() => {
    if (!walking) return;
    const unsub = onEnterRegion(async (locationId) => {
      const place = getLocation(locationId);
      if (!place) return;
      setStatus(t('walk.status.reached', { place: place.label }));

      const story = await getStory(locationId, {
        familyName: family?.members[0]?.displayName
          ? `the ${family.members[0].displayName} family`
          : 'the family',
        presentMembers: family?.members.map((m) => m.displayName) ?? [],
        language: storyLang(lang),
      });
      narrate(story.text, {
        language: storyLang(lang),
        onDone: () => setStatus(t('walk.status.storyFinished')),
      });

      if (family && user) {
        const svc = await import('@/services/firebase').catch(() => null);
        await svc?.unlockMemory(locationId, user.uid).catch(() => {});
        await recomputeTree(family.id).catch(() => {});
      }
    });
    return unsub;
  }, [walking, family, user, t, lang]);

  const startWalk = useCallback(async () => {
    setStatus(t('walk.status.askingPermission'));
    const perm = await requestPermissions({ background: true });
    if (!perm.foreground) {
      setStatus(t('walk.status.permissionDenied'));
    } else {
      await startGeofencing(REGIONS);
      setStatus(perm.background ? t('walk.status.startedBg') : t('walk.status.startedFg'));
    }
    stopWatchRef.current = watchSteps(setLiveSteps);
    setWalking(true);
  }, [t]);

  const endWalk = useCallback(async () => {
    stopWatchRef.current?.();
    stopWatchRef.current = null;
    await stopGeofencing();
    stopNarration();
    setWalking(false);
    setStatus(t('walk.status.ended'));
  }, [t]);

  useEffect(() => () => void endWalk(), [endWalk]);

  const toggleTogether = useCallback(async () => {
    const turningOn = !tree?.isBlooming;
    bloom(turningOn);
    setStatus(turningOn ? t('walk.status.blooming') : t('walk.status.bloomCleared'));
    if (turningOn && isFirebaseConfigured && family) {
      const svc = await import('@/services/firebase').catch(() => null);
      await svc?.bumpWeekStat(family.id, 'togetherMoments').catch(() => {});
      await recomputeTree(family.id).catch(() => {});
    }
  }, [tree?.isBlooming, bloom, family, t]);

  const submitManual = useCallback(async () => {
    const n = parseInt(manual, 10);
    if (!Number.isFinite(n) || n <= 0 || !family || !user) return;
    const entry = manualSteps(user.uid, n);
    const svc = await import('@/services/firebase').catch(() => null);
    await svc?.syncDailySteps(family.id, entry).catch(() => {});
    await recomputeTree(family.id).catch(() => {});
    setStatus(t('walk.status.logged', { n, name: user.displayName }));
    setManual('');
  }, [manual, family, user, t]);

  return (
    <Screen wash="primary">
      <FadeIn>
        <ThemedText type="title">{t('walk.title')}</ThemedText>
      </FadeIn>

      <FadeIn delay={80}>
        <Card style={styles.card}>
          <ThemedText type="label" color="textMuted" uppercase>
            {t('walk.stepsThisWalk')}
          </ThemedText>
          <ThemedText style={{ fontFamily: Fonts.serifSemiBold, fontSize: 52, lineHeight: 58, color: theme.text }} ltr>
            {liveSteps}
          </ThemedText>
          <PillButton
            full
            label={walking ? t('walk.end') : t('walk.start')}
            variant={walking ? 'outline' : 'primary'}
            onPress={walking ? endWalk : startWalk}
          />
          <ThemedText type="small" color="textMuted">
            {status}
          </ThemedText>
        </Card>
      </FadeIn>

      <FadeIn delay={160}>
        <Card style={styles.card}>
          <ThemedText type="heading">{t('walk.together')}</ThemedText>
          <ThemedText type="body" color="textSecondary">
            {t('walk.togetherHint')}
          </ThemedText>
          <PillButton
            full
            variant={tree?.isBlooming ? 'outline' : 'accent'}
            label={tree?.isBlooming ? t('walk.weAreDone') : t('walk.weAreTogether')}
            onPress={toggleTogether}
          />
        </Card>
      </FadeIn>

      <FadeIn delay={240}>
        <Card variant="flat" style={styles.card}>
          <ThemedText type="heading">{t('walk.logManual')}</ThemedText>
          <ThemedText type="small" color="textMuted">
            {t('walk.logManualHint')}
          </ThemedText>
          <View style={styles.manualRow}>
            <TextInput
              value={manual}
              onChangeText={setManual}
              keyboardType="number-pad"
              placeholder={t('walk.stepsPlaceholder')}
              placeholderTextColor={theme.textMuted}
              style={[
                styles.input,
                { color: theme.text, borderColor: theme.border, backgroundColor: theme.surface },
              ]}
            />
            <PillButton label={t('walk.log')} onPress={submitManual} />
          </View>
        </Card>
      </FadeIn>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { alignSelf: 'stretch', gap: Spacing.two },
  manualRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, marginTop: Spacing.one },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: 12,
    fontSize: 16,
  },
});
